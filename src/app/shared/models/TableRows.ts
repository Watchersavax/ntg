import { SubCategory, newCategoryDto } from './Category';
import { NewTemplateVersion } from './TemplateVersion';

export class TableRows {

    serialno: number;
    templateId;
  templateName;
  templateCategory:newCategoryDto;
  archive;
  publishedTemplateVersion:NewTemplateVersion;
  templatePrice;
  templateVersion:NewTemplateVersion[];
  templatePublishedVersion;
  isSystemGenerated:Boolean;
  templateVersionCount: number;
  templateSubCategoryId?:number;
  templateCategoryId?:number;
  templateSubCategory?:SubCategory;
  verificationTypeIds?:number[];
  fastTrackPercentage?;
  templateFastTrackPrice?;
  isCaseRelated?:Boolean;
  }
