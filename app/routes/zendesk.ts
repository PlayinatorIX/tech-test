import express from "express";
import axios from "axios";
import dns from "dns";

const router = express.Router();

// Check if the company has a Zendesk login page (CMD: curl "http://localhost:8080/zendesk/check-login/[INSERT_NAME]"  )
router.get("/check-login/:name", async (req, res) => {
  const name = req.params.name;
  const loginUrl = `https://${name}.zendesk.com`;
  try {
    const response = await axios.get(loginUrl);
    if (response.status === 200) {
      res.status(200).json({ hasLogin: true });
    } else {
      res.status(404).json({ hasLogin: false });
    }
  } catch (error) {
    res.status(404).json({ hasLogin: false });
  }
});



// Check if the company has a support page pointing to a Zendesk host ((CMD: curl "http://localhost:8080/zendesk/check-support/[INSERT_NAME]"  ))
router.get("/check-support/:name", async (req, res) => {
  const name = req.params.name;
  const supportCnames = ["support", "help"]; // Define possible support subdomains

  const results = await Promise.all(
    supportCnames.map((cname) => {
      return new Promise((resolve) => {
        dns.resolveCname(`${cname}.${name}.com`, (err, addresses) => {
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
  if (results.includes(true)) {
    res.status(200).json({ isUsingZendesk: true });
  } else {
    res.status(404).json({ isUsingZendesk: false });
  }
});


//Main task - check domain based on name and return login/support url where applicable ((CMD: curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" http://localhost:8080/zendesk/check-domains ))
router.post("/check-domains", async (req, res) => {
  const companyDomains: string[] = req.body.domains;
  // console.log("Received request with domains:", companyDomains);
  const results = [];
  for (const domain of companyDomains) {
    console.log("Processing domain:", domain);
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



export default router;