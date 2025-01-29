import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('submit-prescription')
  submitPrescription(@Body() prescription: any) {
    return this.pharmacyService.submitPrescription(prescription);
  }
}
