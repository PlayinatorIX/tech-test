"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dns_1 = __importDefault(require("dns"));
const router = express_1.default.Router();
// // Check if the company has a Zendesk login page (CMD: curl "http://localhost:8080/zendesk/check-login/[INSERT_NAME]"  )
// router.get("/check-login/:name", async (req, res) => {
//   const name = req.params.name;
//   const loginUrl = `https://${name}.zendesk.com`;
//   try {
//     const response = await axios.get(loginUrl);
//     if (response.status === 200) {
//       res.status(200).json({ hasLogin: true });
//     } else {
//       res.status(404).json({ hasLogin: false });
//     }
//   } catch (error) {
//     res.status(404).json({ hasLogin: false });
//   }
// });
// // Check if the company has a support page pointing to a Zendesk host ((CMD: curl "http://localhost:8080/zendesk/check-support/[INSERT_NAME]"  ))
// router.get("/check-support/:name", async (req, res) => {
//   const name = req.params.name;
//   const supportCnames = ["support", "help"]; // Define possible support subdomains
//   const results = await Promise.all(
//     supportCnames.map((cname) => {
//       return new Promise((resolve) => {
//         dns.resolveCname(`${cname}.${name}.com`, (err, addresses) => {
//           if (!err) {
//             const hasZendeskCname = addresses.some((address) =>
//               address.endsWith(".zendesk.com")
//             );
//             resolve(hasZendeskCname);
//           } else {
//             resolve(false);
//           }
//         });
//       });
//     })
//   );
//   if (results.includes(true)) {
//     res.status(200).json({ isUsingZendesk: true });
//   } else {
//     res.status(404).json({ isUsingZendesk: false });
//   }
// });
//Main task - check domain based on name and return login/support url where applicable ((CMD: curl -X POST -H "Content-Type: application/json" -d "{\"domains\": [\"FIRST_DOMAIN\", \"SECOND_DOMAIN\", \"Nth_DOMAIN\"]}" http://localhost:8080/zendesk/check-domains ))
router.post("/check-domains", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyDomains = req.body.domains;
    const results = [];
    for (const domain of companyDomains) {
        const loginUrl = `https://${domain}.zendesk.com`;
        let zendeskLoginUrl = null;
        let zendeskSupportCname = null; // Store Canonical Name instead of boolean
        try {
            const loginResponse = yield axios_1.default.get(loginUrl);
            if (loginResponse.status === 200) {
                zendeskLoginUrl = loginUrl;
            }
        }
        catch (error) {
            console.error("Error checking login page for", domain);
        }
        const supportCnames = ["support", "help"];
        const supportResults = yield Promise.all(supportCnames.map((cname) => {
            return new Promise((resolve) => {
                dns_1.default.resolveCname(`${cname}.${domain}.com`, (err, addresses) => {
                    if (!err) {
                        const zendeskCname = addresses.find(address => address.endsWith(".zendesk.com"));
                        resolve(zendeskCname || null); // Resolve with Canonical Name or null
                    }
                    else {
                        resolve(null);
                    }
                });
            });
        }));
        const validSupportResults = supportResults.filter(cname => cname !== null);
        if (validSupportResults.length > 0) {
            zendeskSupportCname = validSupportResults[0]; // Use the first valid Canonical Name
        }
        results.push({
            domain,
            zendeskLoginUrl,
            zendeskSupportCname,
        });
    }
    const formattedResponse = JSON.stringify(results, null, 2);
    res.status(200).send(formattedResponse);
}));
exports.default = router;
