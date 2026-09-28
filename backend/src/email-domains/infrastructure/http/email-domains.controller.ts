import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { emailDomainSchema, type EmailDomainDto, type SaveEmailDomainDto } from '@footix/shared';
import { Authorize } from '../../../auth/infrastructure/http/authorize.decorator.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { AllowEmailDomainService } from '../../application/allow-email-domain.service.js';
import { DeleteEmailDomainService } from '../../application/delete-email-domain.service.js';
import { FindEmailDomainsService } from '../../application/find-email-domains.service.js';

@Controller('email-domains')
export class EmailDomainsController {
  constructor(
    private readonly findEmailDomainsService: FindEmailDomainsService,
    private readonly allowEmailDomainService: AllowEmailDomainService,
    private readonly deleteEmailDomainService: DeleteEmailDomainService,
  ) {}

  @Get()
  @Authorize('email_domains.read')
  findAll(): Promise<EmailDomainDto[]> {
    return this.findEmailDomainsService.execute();
  }

  @Post()
  @Authorize('email_domains.create')
  create(@Body(new ZodValidationPipe(emailDomainSchema)) dto: SaveEmailDomainDto): Promise<EmailDomainDto> {
    return this.allowEmailDomainService.execute(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize('email_domains.delete')
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteEmailDomainService.execute(id);
  }
}
