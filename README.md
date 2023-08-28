# Introduction - Momementum Tech Task

This is my submission for the momentum tech task, you will need node.js. 

Yarn can be used instead of the npm commands show below but I chose to use npm.

To run it please do the following:

```
clone project from github

npm install

npm run build

npm run dev
```

# Notable sections

In zendesk.js there are a few code blocks, the first two can be ignored when evaluating this task however, they illustrate checking for login and support pages in a singular manner, for one domain at a time purely for examples sake.

The main task can be found after these two code blocks, the code for which is also included here:
```
//Main task - check domain based on name and return login/support url where applicable ((CMD: curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" http://localhost:8080/zendesk/check-domains ))
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

    if (supportResults.includes(true)) {
      zendeskSupportUrl = `https://${supportResults.find(Boolean)}.${domain}.zendesk.com`;
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
I ping this endpoint in cmd using the format:
curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" http://localhost:8080/zendesk/check-domains

Where "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" are a json list of company domains. My curl commands were done in windows 10 cmd and required the \ notiation before any speechmarks (\") to stop the string from ending prematurely

For my final test, utiling the company names provided I used the following curl command passing in a json list of the company names:
```
curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"myspace\", \"instapage\", \"biz2credit\", \"reverbnation\", \"oceansapart\", \"zoosk\", \"dailywire\", \"crutchfield\", \"lingotek\", \"atera\", \"rain\", \"mixtiles\", \"lootcrate\"]}" http://localhost:8080/zendesk/check-domains

```

__There is a bat file called send_curl.bat that takes in the companies.txt file and turns it into a curl command, automating this. This can be run by using send_curl.bat (windows 10 cmd line).__

and recieved the following output:
```
[
  {
    "domain": "myspace",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.myspace.zendesk.com"  
  },
  {
    "domain": "instapage",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.instapage.zendesk.com"
  },
  {
    "domain": "biz2credit",
    "zendeskLoginUrl": "https://biz2credit.zendesk.com",
    "zendeskSupportUrl": null
  },
  {
    "domain": "reverbnation",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.reverbnation.zendesk.com"
  },
  {
    "domain": "oceansapart",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.oceansapart.zendesk.com"
  },
  {
    "domain": "zoosk",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.zoosk.zendesk.com"
  },
  {
    "domain": "dailywire",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.dailywire.zendesk.com"
  },
  {
    "domain": "crutchfield",
    "zendeskLoginUrl": "https://crutchfield.zendesk.com",
    "zendeskSupportUrl": null
  },
  {
    "domain": "lingotek",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.lingotek.zendesk.com"
  },
  {
    "domain": "atera",
    "zendeskLoginUrl": null,
    "zendeskSupportUrl": "https://true.atera.zendesk.com"
  },
  {
    "domain": "rain",
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
    "zendeskSupportUrl": "https://true.lootcrate.zendesk.com"
  }
]
```