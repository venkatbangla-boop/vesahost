/* APP-11 synthetic local sourcing, privacy, money, stage and follow-up engine proof. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'../src/domain');
const env={module:{exports:{}},Date,Math,JSON,BigInt};env.globalThis=env;vm.createContext(env);
for(const n of ['buyer-directory.js','opportunity-state.js','followup-scheduler.js'])
 vm.runInContext(fs.readFileSync(path.join(base,n),'utf8'),env,{filename:n});
const E=env.VesaBuyerDirectory,O=env.VesaCRMOpportunityState,F=env.VesaCRMFollowupScheduler;
let buyer=E.create({organizationName:'SYNTHETIC BUYER A',territory:'SYN TERRITORY',sourceRef:'SYN SOURCE REGISTER'});
assert.equal(E.validate(buyer).ok,true);
assert.equal(buyer.revision,0);
assert.deepEqual([...E.potentialDuplicateOrganization([buyer],{organizationName:' synthetic   buyer a ',territory:'syn territory'})],[buyer.id]);
const contact={id:'SYN-CONTACT-1',contactName:'SYN CONTACT PERSON',role:'SYN MERCHANDISER',
 sourceRef:'SYN ROLE DOCUMENT',privacySourceRef:'SYN PRIVACY REGISTER',
 reviewedBy:'SYN REVIEWER',reviewDate:'2026-10-17',consentStatus:'needs-information',email:'sample@example.invalid'};
buyer=E.append(buyer,'contact',contact);
assert.equal(E.validate(buyer).ok,true);
assert.equal(buyer.contacts.length,1);
assert.equal(E.potentialDuplicateContact(buyer,{contactName:'syn contact person',role:'syn merchandiser'}).length,1);
const old=JSON.stringify(buyer);
assert.throws(()=>E.append(buyer,'contact',{...contact,id:'SYN-COPY-CONTACT'}),/Possible duplicate contact/);
assert.equal(JSON.stringify(buyer),old,'No silently merged contact or altered original');
assert.throws(()=>E.append(buyer,'contact',{...contact,id:'BAD-CONTACT',consentStatus:'consented'}),/Consent basis/);
buyer=E.append(buyer,'enquiry',{id:'SYN-ENQ-1',category:'SYN KNIT POLO',styleRequest:'SYN-STYLE-001',sourceRef:'SYN ENQUIRY',
 sourceDate:'2026-10-16',requestedQuantity:1000,unit:'pieces'});
const afterEnquiry=JSON.stringify(buyer);
assert.throws(()=>E.append(buyer,'enquiry',{id:'SYN-ENQ-2',category:'SYN TEE',sourceRef:'SYN SOURCE',
 sourceDate:'2026-10-17',requestedQuantity:1000}),/integer and exact unit/);
assert.equal(JSON.stringify(buyer),afterEnquiry);
assert.equal(O.parseCents('1250.50'),125050n);
assert.equal(O.parseCents('0.10'),10n);
assert.equal(O.parseCents('1250.509'),null,'No guessed monetary rounding');
assert.equal(O.parseCents('-4'),null);
assert.equal(O.money(125050n),'1250.50');
buyer=E.append(buyer,'opportunity',{id:'SYN-OPP-1',enquiryId:'SYN-ENQ-1',stage:'Buyer requested costing',
 stageSourceRef:'SYN WRITTEN STAGE NOTE',reviewedBy:'SYN OPPORTUNITY OWNER',reviewDate:'2026-10-17',
 amount:'1250.50',currency:'USD',amountSourceRef:'SYN DECLARED BUYER VALUE',amountReviewedBy:'SYN REVIEWER',amountReviewDate:'2026-10-17'});
assert.equal(O.pipeline(buyer).byCurrency[0].sourceAmount,'1250.50');
assert.equal(O.pipeline(buyer).byCurrency[0].notRevenue,true);
assert.equal(O.pipeline(buyer).byCurrency[0].probabilityApplied,false);
const previous=JSON.stringify(buyer.opportunities[0]);
buyer=E.append(buyer,'stage',{id:'SYN-STAGE-2',opportunityId:'SYN-OPP-1',stage:'Buyer discussion',
 sourceRef:'SYN BUYER DISCUSSION NOTES',reviewedBy:'SYN OWNER',reviewDate:'2026-10-17'});
assert.equal(JSON.stringify(buyer.opportunities[0]),previous,'Stage change leaves original sourced record intact');
assert.equal(O.latestStage(buyer,'SYN-OPP-1').stage,'Buyer discussion');
assert.equal(O.latestStage(buyer,'SYN-OPP-1').confirmationOfOrder,false);
assert.equal(O.latestStage(buyer,'SYN-OPP-1').winProbability,null);
const beforeStatus=JSON.stringify(buyer);
assert.throws(()=>E.append(buyer,'stage',{id:'FORGE-STAGE',opportunityId:'SYN-OPP-1',stage:'Confirmed',
 sourceRef:'SYN CLAIM',reviewedBy:'SYN',reviewDate:'2026-10-17',confirmedPO:true}),/cannot create confirmed PO/);
assert.equal(JSON.stringify(buyer),beforeStatus);
const pending={id:'SYN-FOLLOWUP-1',linkType:'opportunity',linkId:'SYN-OPP-1',owner:'SYN LOCAL OWNER',
 dueDate:'2026-10-16',createdDate:'2026-10-15',sourceRef:'SYN FOLLOWUP NOTES',status:'open'};
buyer=E.append(buyer,'followup',pending);
assert.equal(F.evaluate(buyer,'2026-10-17')[0].localState,'overdue');
assert.equal(F.evaluate(buyer,'2026-10-16')[0].localState,'due-today');
assert.equal(F.evaluate(buyer,'2026-10-15')[0].localState,'upcoming');
assert.equal(F.evaluate(buyer,'2026-10-17')[0].notificationSent,false);
assert.equal(buyer.status,'LOCAL SOURCE ONLY — NOT BUYER-APPROVED PO');
assert.equal(buyer.audit.at(-1).revision,buyer.revision);
assert.equal(E.validate(buyer).ok,true);
assert.throws(()=>E.append(buyer,'followup',{...pending,id:'SYN-SENT',reminderSent:true}),/cannot claim external message/);
assert.throws(()=>E.append(buyer,'opportunity',{id:'SYN-OPP-BAD',enquiryId:'SYN-ENQ-1',stage:'New',
 stageSourceRef:'SYN',reviewedBy:'SYN',reviewDate:'2026-10-17',amount:'10.00',currency:'USD'}),/separately reviewed source evidence/);
assert.equal(buyer.followups.length,1);
const invalid=E.copy(buyer);invalid.status='PO CONFIRMED BY CRM';
assert.equal(E.validate(invalid).ok,false);
console.log('BUYER CRM M1 PURE DOMAIN PASS: synthetic source-only buyer/contact privacy and cautious duplicate refusal, exact per-currency entered pipeline, immutable stage, explicit dated followups, no automatic PO/probability/email.');
