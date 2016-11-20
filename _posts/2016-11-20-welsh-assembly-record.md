---
layout: post
title: National Assembly for Wales
permalink: blog/national_assembly_record
---

How can technology help us better understand the political conversations that go on in our elected institutions? In this post, I scrape the National Assembly for Wales' *Record of Proceedings*, a substantially verbatim transcript of the proceedings of Plenary meetings, and how these can be scraped and stored using Python and Scrapy to create a machine readable record of the conversations in the Assembly.

-----
<!--more-->

In Wales, we have a devolved [*National Assembly for Wales*](http://www.assembly.wales/), made up of 60 elected Assembly Members (AMs) who are responsible for representing Wales and its people; making laws for Wales; agreeing Welsh taxes and holding the Welsh Government to account. Luckily, the Plenary sessions in the Assembly are all transcribed and are available as HTML on the [Assembly's website](http://www.assembly.wales/en/bus-home/Pages/cofnod.aspx). The number of sessions, and the volume of text in each one makes manually reading through each record quite painstaking. To make the process easier (and to get all the text as JSON) we can use Python and the [Scrapy Framework](https://scrapy.org/), to scrape just the parts we want. First off  start a scrapy project:

```Bash
scrapy startproject assembly_proceedings
```

and in the `spiders/` directory that is created, create a `RecordsSpider` class:

```Python
class RecordsSpider(CrawlSpider):
    name = "records"
    allowed_domains = ["www.assembly.wales"]

    # URL string with format specifiers
    url_string = ("http://www.assembly.wales/en/bus-home/pages/plenary.aspx?" +
                  "assembly=4&category=Record%20of%20Proceedings&startDt=01/{month}/{year}" +
                  "&endDt={end_day}/{month}/{year}")

    # create a list of start urls to crawl formatting the string above
    # so that correct month end dates are used i.e. 28 for February
    # on non-leap years
    start_urls = []
    for year in range(2013, 2016):
        for month in range(1, 13):
            start_urls.append(url_string.format(month=month, year=year,
                                                end_day=monthrange(year, month)[1]))

    rules = (
        Rule(
            LinkExtractor(
                allow=(),
                restrict_xpaths=("//a[contains(text(),'English')]",)
            ),
            callback="parse_records",
            follow=True
        ),
    )
```

The `RecordsSpider` creates a list of `start_urls` which are simply the `url_string` encoded with a year and month, one for each month from January 2013 to the end of 2016. This makes up the URLs needed to request the necessary HTML from the National Assembly website. The spider also has a simple rule set up that makes sure it only follows xpaths that contain 'English' in them.

The class has a single method `parse_records`, that takes a response, parses it for a number of variables (date of publication, time of contribution etc.). This method is set as the callback function in the single `Rule` object we have in the `rules` variable.

```Python
def parse_records(self, response):
        # XPaths
        date_xpath = '//*[@id="ropDate"]/span/text()'
        contribution_xpath = '//div[@class="transcriptContribution"]'
        time_xpath = 'div[@class="timeContainer"]/span/text()'
        contribution_container_xpath = 'div[@class="contributionContainer"]'
        member_name_xpath = 'div[@class="memberNameContainer"]/span[@class="memberName"]/text()'
        contribution_text_xpath = 'div[@class="contribContainer"]/text()'
        contribution_question_xpath = 'div[@class="contribContainer"]/span[@class="contributeTypeO"]/text()'

        # Item that will hold the data
        item = RecordItem()
        # Date record being parsed took place on
        date = response.selector.xpath(date_xpath).extract()
        # 'date' in item should be a list of dicts
        item['date'] = date
        # List of all contributions made in the record being parsed
        contributions = response.xpath(contribution_xpath)

        # Log the date being parsed
        print('Parsing the plenary session held on {}'.format(date))

        item['contributions'] = []

        # Loop through the contributions, store each one as a dict in a list
        for contribution in contributions:
            # Time of the contribution
            contribution_time = contribution.xpath(
                time_xpath).extract_first(default=None)

            # Select the container element that holds other details
            contribution_container = contribution.xpath(
                contribution_container_xpath
            )

            # Name of the AM contributing
            contributor_name = contribution_container.xpath(
                member_name_xpath).extract_first(default=None)

            # What was said
            contribution_text = contribution_container.xpath(
                contribution_text_xpath).extract_first(default=None)

            # Text of a written question
            contribution_question = contribution_container.xpath(
                contribution_question_xpath).extract_first(default=None)

            # dict to hold our data
            contribution_dict = {}

            # All verbal submissionshave a time stamp
            # other elements (such as agenda headings and votes) don't
            # so this if statement stops empty values entering
            # the data
            if contribution_time is not None:

                contribution_dict['contribution_time'] = contribution_time
                contribution_dict['contributor_name'] = contributor_name

                # Contribution text and questions don't exist at the same
                # time, so the below just stops empty key: value pairs
                # entering the data
                if contribution_text is not None:
                    contribution_dict['contribution_text'] = contribution_text

                if contribution_question is not None:
                    contribution_dict['contribution_question'] = contribution_question

                item['contributions'].append(contribution_dict)
        return item
```

Notice that we define an `item` variable of type `RecordItem()`, which is itself a subclass of `scrapy.Items`, and is imported from `items.py`:

```Python
# items.py file
import scrapy


class RecordItem(scrapy.Item):
    # Metadata associated once with each record
    # date of plenary
    date = scrapy.Field()
    contributions = scrapy.Field()
```

This simply holds the fields that we are interested in storing, which are the date and contribution text.

Finally, we define an item pipeline in `pipelines.py`, which will allow us to store items when invoking the scrapy command using the `-o` flag:

```Python
# pipelines.py file
class GetRecordsPipeline(object):
    def process_item(self, item, spider):
        return item
```

The full code can be found [here](https://github.com/JamesGardiner/assembly_proceedings/tree/master/src/data/get_records) and includes some boilerplate for generating output files of data. The command used to start the scrape is:

```Bash
scrapy crawl records -o
```

where `records` corresponds to the `name` value of the spider.

Once the spider has run, we have JSON formatted speech from the Assembly proceedings, which can then be used in things like topic analysis and other Natual Language Processing methods. Below is a snippet of the data:

```JSON
[
  {
    "contributions": [
      {
        "contribution_time": "13:30",
        "contribution_text": "Good afternoon. Attractive though your back is, Alun Davies, I would rather see your face. [Laughter.] That is now on the record. The National Assembly for Wales is now in session.",
        "contributor_name": "Y Llywydd / The Presiding Officer"
      },
      {
        "contribution_time": "13:30",
        "contribution_text": "Yesterday, Andrew R. T. Davies raised a point of order regarding remarks made by the First Minister during questions to him. I have now had the opportunity to review the Record of Proceedings. The First Minister’s questions is the opportunity for Members to scrutinise the First Minister, and robust, spirited debate is expected. However, I expect all Members to behave courteously, even when both sides are disputing evidence. I would remind Members that they should not make remarks in the Chamber that appear to call into question another Member’s integrity. Thank you.",
        "contributor_name": "Y Llywydd / The Presiding Officer"
      },
      {
        "contribution_question": "1. Will the Minister make a statement on curriculum developments for schools. OAQ(4)0232(ESK)",
        "contribution_time": "13:31",
        "contributor_name": "David Rees"
      }
    ]
  }
]
```


This is a little side project for me but I'm hoping that by making the data and code available others might be able to pick this up and do some interesting analyses with it.
