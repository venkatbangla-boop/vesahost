# VESA 360 - Domain Ownership Matrix and Manual Integration Policy

## Source-of-truth matrix

| Record or action | ONLY primary owner | Allowed secondary access | Never do |
|---|---|---|---|
| Critical Path, forecast and TNA milestone | TNA 360 | Shipment/Production/materials may supply explicit observed snapshots | Duplicate TNA schedule engine in each app |
| PPM checks, preproduction GO/HOLD | PPM 360 | Sample/Tech/Label provide referenced source evidence | Auto-set GO because another app says Approved |
| AQL sampling, Ac/Re, AR11 selected/inspected carton list | AQL 360 | Packing may provide eligible carton ID snapshot; Claims reads inspection reference | Use Packing randomizer to replace frozen AQL selection |
| Garment cost breakdown, quoted FOB, margin | Costing 360 | Supplier Comparison provides dated material offer snapshot | Recompute different FOB formulas in Commission app |
| Physical packing configurations and CBM plans | Packing & Container | Shipment Docs imports approved packing snapshot | Let Shipment mutate packed carton source record |
| Commission contract and commission receivable | Order & Commission | PO/LC reference IDs | Treat LC settlement as commission receipt |
| Garment tech measurements, POM, tolerances, spec revision | Tech Pack & Spec | Sampling/Artwork/Costing reference revisions | Invent grade/tolerance from other buyer styles |
| Sample submission and buyer sample decision | Sampling & Approval | TNA/PPM read explicit approval provenance | Infer buyer approval from due date or factory comment |
| Master/B2B LC and bank/factory settlement obligations | LC & Payment | TNA milestone and Shipment document IDs | Execute banking or merge commission ledger |
| Material booking, received/allocated/shortage | Fabric & Trims | TNA readiness, Costing snapshot | Treat supplier quote as physically received inventory |
| Shipping invoice/documents and shipment file versions | Shipment & Documentation | PO/Packing/LC/AQL references | Declare official customs/bank release from a draft |
| Factory/site profiles and declared capabilities | Factory & Vendor | PO/Production supplier IDs | Self-certify BSCI/WRAP or physical site capacity |
| Daily stage output and WIP | Production Tracker | TNA consumes manual production references | Sum cut + sew + finish as final goods |
| Artwork/label revisions and artwork review | Label & Artwork Approval | Tech Pack/Sampling revision references | Assume regulatory labeling compliance |
| Buyer contact and opportunity follow-up | Buyer CRM | Product Dev/Costing/PO verified buyer ID | Silently share personal data across apps or GitHub |
| Dated fabric vendor offer comparison | Fabric & Supplier Comparison | Costing/material planning explicit chosen snapshot | Override Costing raw quote with current guessed internet prices |
| Commercial PO header/line/qty/revision | Purchase Order 360 (future canonical) | TNA/Commission/Packing/Shipment reviewed PO snapshot | Silent migration/overwrite of existing TNA order plan |
| Claim/settlement case | Claims & Disputes | AQL/shipment/PO read-only references | Rewrite original inspection, invoice or PO result |
| Style ideas, moodboard and concept versions | Product Development | Tech Pack/Label/Costing referenced after promotion | Treat unapproved concept as confirmed production spec |

## Handling the existing TNA order fields

TNA already has its own scheduling-order structure. Before Purchase Order 360 is built, keep existing TNA behavior unchanged. New Commission/Packing apps may accept a **typed manual PO/source reference and source quantity snapshot**. Later PO 360 may become the commercial PO master, but ONLY after a documented ownership migration with explicit versioned export/import and regression checks. The TNA plan must not be silently rewritten.

## Reference-only typed schema (proposal)

```json
{
  "sourceApp": "purchase-order",
  "recordType": "PORevision",
  "recordId": "DEMO-PO-001",
  "revisionId": "R1",
  "sourceDate": "2026-10-14",
  "verifiedBy": "Demo Reviewer",
  "verifiedAt": "2026-10-14T10:00:00Z",
  "displaySnapshot": {
    "poNumber": "DEMO-PO-001",
    "quantityPieces": 1000,
    "currency": "USD"
  },
  "sourceDigest": null,
  "sourceDocumentRef": null
}
```

**IMPORTANT:** This JSON is only a synthetic illustrative shape. Not a live auth signature or a validated current-version interchange schema. `sourceDigest` can detect accidental data change if verified but is NOT third-party authenticity proof. No sibling-store reads. No external sync. User must confirm a snapshot on import and know it may become stale.

## Manual link workflow

1. User exports a controlled saved copy/reference from the source app with no secrets and a bounded size.
2. User opens a destination app and chooses `Link Record` or `Open Saved Copy`.
3. Destination previews app/version, source ID/revision/date, values, unresolved fields and provenance.
4. User explicitly selects `Use This Snapshot`; the destination saves it in its OWN local record with source fields unchanged.
5. If source revision changes, show `May be out of date`; do not auto-sync or overwrite the previous version.
6. External decisions (buyer approval, bank receipt, AQL pass, PPM GO) remain independent documented decisions.

## Example cross-app value chain (no hidden sync)

```text
Buyer CRM enquiry ---------> (reference) Product Development concept
                                         |
                                         v
                                  Tech Pack & Spec
                                         |
                     Sampling & Approval + Label/Artwork
                                         |
   Fabric Supplier Comparison ----------> Costing 360
                                         |
                                 Purchase Order 360
                                         |
                +------------+-----------+-----------+
                |            |                       |
          Commission     LC & Payment          Packing & Container
                |            |                       |
                +---------- TNA / PPM          Shipment Documents
                                  |                  |
                         Production Tracker          +--> AQL (inspection only)
                                                         |
                                                   Claims & Disputes
```

Every arrow means a **user-reviewed reference/snapshot**, not a live data connection. The diagram shows possible information flow, not a mandatory sequential dependency for every MVP.

## Compatibility responsibilities

- Provider/backend/remote syncing remain deferred; zero implicit HTTP calls for user records.
- Public repository/Pages code cannot enforce server-side credential secrecy. Local browser login is convenience only.
- Synthetic fixtures only: use `DEMO-...` IDs and fictional parties; do not bundle real buyer worksheets/tech packs.
- Each source app owns its status; status changes never cascade across apps automatically.
- Reference import/export contracts must be independently versioned and regression tested before a second app consumes them.