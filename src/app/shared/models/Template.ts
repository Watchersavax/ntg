import { newCategoryDto } from './Category';
import { NewTemplateVersion } from './TemplateVersion';

export class Template{
  templateId;
  templateName;
  templateCategoryId;
  templateValue;
  templatePrice;
  publishedVersionId;
  templatePublishedVersion;
  templateCategoryName;
  versions:string [];
  isPublished;
  templateCategoryParentId;
  newTemplateVersionName;
}

export class NewTemplate{
  templateId;
  templateName;
  templateCategory:newCategoryDto;
  archive;
  publishedTemplateVersion:NewTemplateVersion;
  templatePrice;
  templateVersion:NewTemplateVersion[];
  templatePublishedVersion;
  isSystemGenerated;
  templateVersionCount
}