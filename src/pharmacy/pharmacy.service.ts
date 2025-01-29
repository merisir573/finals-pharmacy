import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class PharmacyService {
  private readonly rabbitmqUri = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';

  private async getFromQueue(prescriptionId: string, tc: string, fullName: string, medicines: string[]) {
    const connection = await amqp.connect(this.rabbitmqUri);
    const channel = await connection.createChannel();
    const queue = 'prescriptions';

    await channel.assertQueue(queue, { durable: true });

    let prescriptionFound = null;
    let messages = await channel.get(queue, { noAck: false });

    while (messages) {
      const prescription = JSON.parse(messages.content.toString());

      // ✅ Check if prescriptionId, TC, Full Name, and Medicines match
      if (
        prescription.prescriptionId === prescriptionId &&
        prescription.patientTc === tc &&
        prescription.patientName.toLowerCase() === fullName.toLowerCase() &&
        JSON.stringify(prescription.medicines.sort()) === JSON.stringify(medicines.sort())
      ) {
        prescriptionFound = prescription;
        channel.ack(messages); // Remove from queue
        break;
      }

      messages = await channel.get(queue, { noAck: false });
    }

    return prescriptionFound;
  }

  async submitPrescription(prescription: any) {
    if (!prescription.prescriptionId || !prescription.patientTc || !prescription.patientName || !prescription.medicines) {
      throw new Error('Missing required fields: prescriptionId, patientTc, patientName, or medicines.');
    }

    const matchedPrescription = await this.getFromQueue(
      prescription.prescriptionId,
      prescription.patientTc,
      prescription.patientName,
      prescription.medicines
    );

    if (matchedPrescription) {
      console.log(`✅ Prescription Processed: ${JSON.stringify(matchedPrescription)}`);
      return { status: 'Success', message: 'Prescription successfully processed!', data: matchedPrescription };
    } else {
      return { status: 'Not Found', message: 'No matching prescription found in queue.' };
    }
  }
}
