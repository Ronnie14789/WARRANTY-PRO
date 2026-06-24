import PDFDocument from 'pdfkit';
import { getClaimById } from '../claims/claims.service.js';

export const generateCirPdf = async (claimId: string): Promise<Buffer> => {
  const claim = await getClaimById(claimId);

  if (!claim) {
    throw new Error('Claim not found');
  }

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));

  doc.fontSize(18).text('Claim Investigation Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(11);

  const writeLine = (label: string, value: string | number | undefined) => {
    doc.text(`${label}: ${value ?? '-'}`);
  };

  writeLine('Claim Number', claim.claimNumber);
  writeLine('Status', claim.status);
  writeLine('Vehicle Registration', claim.vehicle.registrationNumber);
  writeLine('VIN', claim.vehicle.vin);
  writeLine('Failed Part', `${claim.failedPart.partName} (${claim.failedPart.partNumber})`);
  writeLine('Failure Date', claim.failureDate.toISOString());
  writeLine('Failure Location', claim.failureLocation);
  writeLine('Breakdown Location', claim.breakdownLocation);
  writeLine('Symptoms', claim.symptoms);
  writeLine('Incident Description', claim.incidentDescription);

  doc.moveDown().fontSize(13).text('Investigation Findings');
  claim.investigations.forEach((investigation, index: number) => {
    doc.moveDown().fontSize(11).text(`Investigation #${index + 1}`);
    writeLine('Inspection Date', investigation.inspectionDate.toISOString());
    writeLine('Inspection Location', investigation.inspectionLocation);
    writeLine('Root Cause Category', investigation.rootCauseCategory);
    writeLine('Root Cause Explanation', investigation.rootCauseExplanation);
    writeLine('Conclusion', investigation.conclusion);
    investigation.findings.forEach((finding) => {
      writeLine('Visual Notes', finding.visualInspectionNotes);
      writeLine('Measurements', finding.measurements);
      writeLine('Wear Pattern Analysis', finding.wearPatternAnalysis);
      writeLine('Damage Description', finding.damageDescription);
    });
  });

  doc.moveDown().fontSize(13).text('Corrective Actions');
  claim.correctiveActions.forEach((action, index: number) => {
    doc.moveDown().fontSize(11).text(`Action #${index + 1}`);
    writeLine('Recommended Action', action.recommendedAction);
    writeLine('Repair Method', action.repairMethod);
    writeLine('Replacement Recommendation', action.replacementRecommendation);
    writeLine('Preventive Measures', action.preventiveMeasures);
  });

  doc.moveDown().fontSize(13).text('Attachments');
  claim.attachments.forEach((attachment) => {
    writeLine('Attachment', `${attachment.fileName} (${attachment.mimeType})`);
  });

  writeLine('Investigation Conclusion', claim.investigations.at(-1)?.conclusion);
  writeLine('Approval Signature', 'Digitally approved in WCIMS');

  doc.end();

  return await new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
};
