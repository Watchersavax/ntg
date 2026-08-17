export class Category{
    templateCategoryId;
    templateCategoryName;
    parentId;
    templateParentCategoryName;
    active;
  }

  export class SubCategory{
    templateSubCategoryId;
    templateSubCategoryName;
    templateCategoryId;
    active;
  }

export class CategorySubCategoryTemplate{
  ParentCategoryId;
  ParentCategoryName;
  SubCategoryArray:SubCategoryObj[];
}
  
export class SubCategoryObj{
  SubCategoryId;
  SubCategoryName;
  TemplateNameList:string[]=[];
}

export class newCategoryDto{
  templateCategoryId;
  templateCategoryName;
  parentId;
  templateParentName;
  templateName;
}