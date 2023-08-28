# Introduction - Momementum Tech Task

This is my submission for the momentum tech task, you will need node.js. 

Yarn can be used instead of the npm commands show below but I chose to use npm.

To run it please do the following:

```
//clone project from github using: 
git clone https://github.com/PlayinatorIX/tech-test.git

//cd to the folder and run the following:

npm install

npm run build

npm run dev
```

# tl:dr

__How to input a list of companies__

My api takes in a json list and gives you its intended output. 

For simplicities sake within the project folder, in windows 10, you can run:
```send_curl.bat```
Which will take the contents of companies.txt and turn it into a request after some cleaning.

You can edit companies.txt if you would like and run the code at your leisure.

<br><br>

__Request Formats__

Remember to replace the FIRST_DOMAIN etc. placeholders with n domain names:

CMD/BASH:
```
curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" http://localhost:8080/zendesk/check-domains (windows 10 cmd and BASH curl request)
```
Powershell:
``` 
Invoke-RestMethod -Uri "http://localhost:8080/zendesk/check-domains" -Method Post -Headers @{"Content-Type" = "application/json"} -Body '{"domains": ["FIRST_DOMAIN", "SECOND_DOMAIN", "Nth_Domain"]}'
```
where domains are a website name e.g. google.com would be "google"

<br><br>

__plugin and play commands:__

CMD/BASH: 
```
curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"myspace\", \"instapage\", \"biz2credit\", \"reverbnation\", \"oceansapart\", \"zoosk\", \"atera\", \"rain\", \"mixtiles\", \"lootcrate\", \"dailywire\", \"crutchfield\", \"lingotek\"]}" http://localhost:8080/zendesk/check-domains
```
Powershell:
```
Invoke-RestMethod -Uri "http://localhost:8080/zendesk/check-domains" -Method Post -Headers @{"Content-Type" = "application/json"} -Body '{"domains": ["myspace", "instapage", "biz2credit", "reverbnation", "oceansapart", "zoosk", "dailywire", "crutchfield", "lingotek", "atera", "rain", "mixtiles", "lootcrate"]}'
```
Enjoy :) 

(also a copy of the output for the companies.txt file provided has been included at the bottom)

<br><br>

# Notable sections

In zendesk.ts there are a few code blocks, the first two can be ignored when evaluating this task however, they illustrate checking for login and support pages in a singular manner, for one domain at a time purely for examples sake.

The main task can be found after these two code blocks, the code for which is also included here:
```
router.post("/check-domains", async (req, res) => {
  const companyDomains: string[] = req.body.domains;
  // console.log("Received request with domains:", companyDomains);
  const results = [];
  for (const domain of companyDomains) {
    // console.log("Processing domain:", domain);
    const loginUrl = `https://${domain}.zendesk.com`;
    let zendeskLoginUrl = null;
    let zendeskSupportUrl = null;
    try {
      const loginResponse = await axios.get(loginUrl);
      if (loginResponse.status === 200) {
        zendeskLoginUrl = loginUrl;
      }
    } catch (error) {
      console.error("Error checking login page for", domain);
    }
    const supportCnames = ["support", "help"];
    const supportResults = await Promise.all(
      supportCnames.map((cname) => {
        return new Promise((resolve) => {
          dns.resolveCname(`${cname}.${domain}.com`, (err, addresses) => {
            if (!err) {
              const hasZendeskCname = addresses.some((address) =>
                address.endsWith(".zendesk.com")
              );
              resolve(hasZendeskCname);
            } else {
              resolve(false);
            }
          });
        });
      })
    );

    const trueIndex = supportResults.findIndex(result => result === true);
    if (trueIndex !== -1) {
      zendeskSupportUrl = `https://${supportCnames[trueIndex]}.${domain}.zendesk.com`;
    }

    results.push({
      domain,
      zendeskLoginUrl,
      zendeskSupportUrl,
    });
  }
  // console.log("Sending response:", results);
  const formattedResponse = JSON.stringify(results, null, 2);
  res.status(200).send(formattedResponse);
});
```
This code snippet defines an API endpoint that receives a list of company domain names and checks each domain to determine if it has a Zendesk login page or support page. The endpoint responds with a JSON array containing information about each domain, including its name, Zendesk login URL (if applicable), and Zendesk support URL (if applicable). The code iterates through the list of domains, making HTTP requests to check for login pages and using DNS queries to identify support pages. The response is formatted for clarity, with indentation and line breaks. This API endpoint can be used to quickly gather Zendesk-related information for a list of company domains.

<br><br>

# ping(ing) the endpoint

I ping this endpoint in cmd using the format:

curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" http://localhost:8080/zendesk/check-domains

Where "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" are a json list of company domains. My curl commands were done in windows 10 cmd and required the \ notiation before any speechmarks (\") to stop the string from ending prematurely

For my final test, utiling the company names provided I used the following curl command passing in a json list of the company names:

__There is a bat file called send_curl.bat that takes in the companies.txt file and turns it into a curl command, automating this. This can be run by using send_curl.bat (windows 10 cmd line).__


```
curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"myspace\", \"instapage\", \"biz2credit\", \"reverbnation\", \"oceansapart\", \"zoosk\", \"dailywire\", \"crutchfield\", \"lingotek\", \"atera\", \"rain\", \"mixtiles\", \"lootcrate\"]}" http://localhost:8080/zendesk/check-domains

```


and recieved the following output:
```
[
  {
    "domain": "myspace",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://help.myspace.zendesk.com"
  },
  {
    "domain": "instapage",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://help.instapage.zendesk.com"
  },
  {
    "domain": "biz2credit.zendesk",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": null
  },
  {
    "domain": "reverbnation",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://help.reverbnation.zendesk.com"
  },
  {
    "domain": "oceansapart",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://support.oceansapart.zendesk.com"
  },
  {
    "domain": "zoosk",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://help.zoosk.zendesk.com"
  },
  {
    "domain": "dailywire",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://support.dailywire.zendesk.com"
  },
  {
    "domain": "crutchfield",
    "zendeskLoginUrl": "https://crutchfield.zendesk.com",
    "zendeskSupportUrl": null
  },
  {
    "domain": "lingotek",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://support.lingotek.zendesk.com"
  },
  {
    "domain": "atera",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://support.atera.zendesk.com"
  },
  {
    "domain": "support.rain.co",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": null
  },
  {
    "domain": "mixtiles",
    "zendeskLoginUrl": "https://mixtiles.zendesk.com",
    "zendeskSupportUrl": null
  },
  {
    "domain": "lootcrate",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://help.lootcrate.zendesk.com"
  }
]
```

Having checked this with MXToolbox I am confident in the output.

<br><br>

# Closing Notes
Finally, as I am concious of time and would like to submit this to you before any decision making occurs, I have not implemented various error handling methods that could have been included but in an ideal world I would have included the following:

- HTTP Request Errors
- DNS Resolution Errors
- Input Validation
- Error Logging
- Graceful Fallback
- Rate Limiting
- Response Validation
- Exception Handling
- Status Codes
- Data Validation

as well as streamlining the api call somewhat.

Thank you.