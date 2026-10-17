# VESA 360 - Open Decisions and No-Guess Register

**Status:** Planning list, not development failures. Core arithmetic and generic UI can progress while source-dependent policies remain `Needs Information`.

| App ID | Application | Priority | Wave | First critical policy question | Consequence |
|---|---|---:|---|---|---|
| APP-01 | Packing & Container 360 | 1 | W1 | Container equipment data source and permitted container catalogue | Needs business owner decision before affected rule; independent development may continue |
| APP-02 | Order & Commission 360 | 2 | W1 | Commission basis: total FOB, shipped FOB, invoiced FOB or received FOB | Needs business owner decision before affected rule; independent development may continue |
| APP-03 | Tech Pack & Spec 360 | 3 | W1 | Buyer-specific POM master and grading increments | Needs business owner decision before affected rule; independent development may continue |
| APP-13 | Purchase Order 360 | 4 | W2 | Canonical PO authority when TNA and PO app both hold order fields | Needs business owner decision before affected rule; independent development may continue |
| APP-05 | LC & Payment 360 | 5 | W2 | Start event and date/calendar day convention for each usance | Needs business owner decision before affected rule; independent development may continue |
| APP-04 | Sampling & Approval 360 | 6 | W2 | Buyer sample categories/approval authorities | Needs business owner decision before affected rule; independent development may continue |
| APP-06 | Fabric & Trims 360 | 7 | W2 | Quantity units and lot/shade control policy | Needs business owner decision before affected rule; independent development may continue |
| APP-07 | Shipment & Documentation 360 | 8 | W3 | Required country/buyer document list | Needs business owner decision before affected rule; independent development may continue |
| APP-09 | Production Tracker 360 | 9 | W3 | Definition of good units, rework/reject, transfer and shift close | Needs business owner decision before affected rule; independent development may continue |
| APP-08 | Factory & Vendor 360 | 10 | W3 | Approval criteria and evidence authority | Needs business owner decision before affected rule; independent development may continue |
| APP-10 | Label & Artwork Approval 360 | 11 | W3 | Approved care-label content/regional rules | Needs business owner decision before affected rule; independent development may continue |
| APP-11 | Buyer CRM 360 | 12 | W4 | Consent/contact-retention basis for real records | Needs business owner decision before affected rule; independent development may continue |
| APP-12 | Fabric & Supplier Comparison 360 | 13 | W4 | Which conversions are valid for fabrics and widths | Needs business owner decision before affected rule; independent development may continue |
| APP-14 | Claims & Disputes 360 | 14 | W4 | Who can approve or close claims | Needs business owner decision before affected rule; independent development may continue |
| APP-15 | Product Development 360 | 15 | W4 | Approved image/material sources and licenses | Needs business owner decision before affected rule; independent development may continue |

## Decision classes

- **Must be settled before a specific calculation:** business rates/commission basis, material/unit conversions, size grading, legal/bank maturity start event, AQL/buyer-approved acceptance logic, label compliance, true container loadability claim.
- **Safe to postpone for an MVP:** optional external certifications, independent physical factory pilot, native printer/scanner, commercial hosting or back-end security (these are outside the current demo scope), live bank/buyer connectivity, future cross-device sharing.
- **Must always be stated:** evidence source, date/edition, unit/currency/timezone, actor/version where an approval is claimed.

## Owner decision record template

```text
DECISION ID: DEC-APP-XX-001
App / scope: 
Question: 
Candidate rules supported by sources: 
Approved source / document revision / owner / date: 
Chosen rule / allowed default (if any): 
Tests and expected cases to add: 
Affected files / saved format / migration impact: 
Approval verdict: DRAFT / APPROVED / REJECTED / DEFERRED
```

Do not treat the roadmap itself as a binding buyer or factory policy source. Do not invent existing contract terms or output a meaningful monetary value when essential inputs are absent.
