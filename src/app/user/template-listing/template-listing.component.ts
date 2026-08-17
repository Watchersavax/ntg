import { UserdataService } from '../userservices/userdata.service';
import { CategorySubCategoryTemplate, Category } from 'src/app/shared/models/Category';
import { DataService } from '../userservices/data.service';
import { TableRows } from 'src/app/shared/models/TableRows';

import {FlatTreeControl} from '@angular/cdk/tree';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { CategoryList } from 'src/app/shared/models/CategoryList';
import { Router } from '@angular/router';

/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
class CategoryNode {
  name: string;
  categoryid:number;
  templateflag:boolean=false;
  children?: CategoryNode[];
}

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-template-listing',
  templateUrl: './template-listing.component.html',
  styleUrls: ['./template-listing.component.css'],
})
export class TemplateListingComponent implements AfterViewInit {
  
  categories: Category[] = [];
  categorysubtemp:CategorySubCategoryTemplate[] = [];
  previousevent;
  templatelist :TableRows[] = [];
  categorynoderemovearray:CategoryNode[]=[];
  categorynodeindexremove:number[]=[];
  error:string;
  @ViewChild('tree',{static:true}) tree;

  treeControl = new FlatTreeControl<ExampleFlatNode>( node => node.level, node => node.expandable);

  _transformer = (node: CategoryNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  TREE_DATA: CategoryNode[] = [];

  constructor(private dataservice:DataService, private userdataservice:UserdataService,private router:Router) {

    if(this.userdataservice.templatelist != undefined && this.userdataservice.templatelist != null &&  this.userdataservice.templatelist.length != 0){
      this.templatelist = [...this.userdataservice.templatelist];

        //fetch category list first 
        this.dataservice.fetchCategoryList().subscribe((data1:CategoryList)=>{
          this.categories = data1.data;
          this.categories.forEach(category=>{
            
            let node = new CategoryNode();
            if(category.parentId  === null){

              node.categoryid = category.templateCategoryId;
              node.name = category.templateCategoryName;
              node.children = [];
              
              //find templates for this particular category
              this.templatelist.forEach(template=>{
                
                if(template.templateCategory.templateCategoryName === category.templateCategoryName){
                  let endtemplatenode = new CategoryNode();
                    endtemplatenode.categoryid = template.templateId;
                    endtemplatenode.name = template.templateName;
                    endtemplatenode.templateflag = true;
                  node.children.push(endtemplatenode)
                }

              });

              this.TREE_DATA.push(node);
              this.dataSource.data = this.TREE_DATA;
            
            }else{
              for(let i=0;i<this.TREE_DATA.length;i++){
                let parentnode = this.findParentNode(category.parentId,0,this.TREE_DATA[i]);
                
                if(parentnode !=null){

                  if(parentnode.children === undefined)
                    parentnode.children = [];

                  let node = new CategoryNode();
                  node.categoryid = category.templateCategoryId;
                  node.name = category.templateCategoryName;
                  node.children =[];

                  //find templates for this particular category
                  this.templatelist.forEach(template=>{
                    
                    if(template.templateCategory.templateCategoryName === category.templateCategoryName){
                      let endtemplatenode = new CategoryNode();
                        endtemplatenode.categoryid = template.templateId;
                        endtemplatenode.name = template.templateName;
                        endtemplatenode.templateflag = true;
                      node.children.push(endtemplatenode)
                    }

                  });

                  parentnode.children.unshift(node);
                  this.dataSource.data = this.TREE_DATA;
                  break;
                }
              }

            }

          });
        
          //removing those node which are not templates and end nodes 
          //depth first search on Trees Algorithm used
          for(let j=0;j<this.TREE_DATA.length;j++){

            this.findParentNodeToRemoveEndCategoryNodes(this.TREE_DATA[j],0,null);
          
          }

          //removing those node which are not templates and end nodes 
          //depth first search on Trees Algorithm used
          for(let i=this.categorynoderemovearray.length-1;i>=0;i--){

            this.categorynoderemovearray[i].children.splice(this.categorynodeindexremove[i],1);
            this.categorynodeindexremove.splice(i,1);
          
          }

          this.dataSource.data = this.TREE_DATA;
          this.tree.treeControl.expandAll();

        });

    }else{
            
          //fetch template list first
          this.userdataservice.templatelistdataflag.subscribe(data=>{
            
            this.templatelist = data;

            //fetch category list first 
            this.dataservice.fetchCategoryList().subscribe((data1:CategoryList)=>{
              this.categories = data1.data;
              this.categories.forEach(category=>{
                
                let node = new CategoryNode();
                if(category.parentId  === null){

                  node.categoryid = category.templateCategoryId;
                  node.name = category.templateCategoryName;
                  node.children = [];
                  
                  //find templates for this particular category
                  this.templatelist.forEach(template=>{
                    
                    if(template.templateCategory.templateCategoryName === category.templateCategoryName){
                      let endtemplatenode = new CategoryNode();
                        endtemplatenode.categoryid = template.templateId;
                        endtemplatenode.name = template.templateName;
                        endtemplatenode.templateflag = true;
                      node.children.push(endtemplatenode)
                    }

                  });

                  this.TREE_DATA.push(node);
                  this.dataSource.data = this.TREE_DATA;
                
                }else{
                  for(let i=0;i<this.TREE_DATA.length;i++){
                    let parentnode = this.findParentNode(category.parentId,0,this.TREE_DATA[i]);
                    
                    if(parentnode !=null){

                      if(parentnode.children === undefined)
                        parentnode.children = [];

                      let node = new CategoryNode();
                      node.categoryid = category.templateCategoryId;
                      node.name = category.templateCategoryName;
                      node.children =[];

                      //find templates for this particular category
                      this.templatelist.forEach(template=>{
                        
                        if(template.templateCategory.templateCategoryName === category.templateCategoryName){
                          let endtemplatenode = new CategoryNode();
                            endtemplatenode.categoryid = template.templateId;
                            endtemplatenode.name = template.templateName;
                            endtemplatenode.templateflag = true;
                          node.children.push(endtemplatenode)
                        }

                      });

                      parentnode.children.unshift(node);
                      this.dataSource.data = this.TREE_DATA;
                      break;
                    }
                  }

                }

              });
            
              //removing those node which are not templates and end nodes 
              //depth first search on Trees Algorithm used
              for(let j=0;j<this.TREE_DATA.length;j++){
                this.findParentNodeToRemoveEndCategoryNodes(this.TREE_DATA[j],0,null);
                
              }
              
              //removing those node which are not templates and end nodes 
              //depth first search on Trees Algorithm used
              //using dfs for removing categories which dont have templates inside
              for(let i=this.categorynoderemovearray.length-1;i>=0;i--){
                this.categorynoderemovearray[i].children.splice(this.categorynodeindexremove[i],1);
                this.categorynodeindexremove.splice(i,1);
              }    
             
              this.dataSource.data = this.TREE_DATA;
              this.tree.treeControl.expandAll();
            });

          });
      }

   }

   ngAfterViewInit() {
    }

   //doing dfs to find the node over tree
    //depth first search on Trees Algorithm used
   findParentNode(parentnodeid,depth,currentnode){

    let finalnode = new CategoryNode();

    if(currentnode.categoryid === parentnodeid){
      return currentnode;
    }

    if(currentnode.children != null && currentnode.children !=undefined){
      for(let i=0;i<currentnode.children.length;i++){
        finalnode = this.findParentNode(parentnodeid,depth,currentnode.children[i]);
        if(finalnode != null)
          return finalnode;
      }
    }

    return null;
   }

   findParentNodeToRemoveEndCategoryNodes(currentnode:CategoryNode,index,parent){
    
    let flag = false;

    if(currentnode.templateflag === false && ( currentnode.children.length === 0 || currentnode.children.length === undefined)){
      this.categorynoderemovearray.push(parent);
      this.categorynodeindexremove.push(index);
      return true;
    }

    if(currentnode.children != null && currentnode.children !=undefined){
      for(let i=0;i<currentnode.children.length;i++){
        flag = this.findParentNodeToRemoveEndCategoryNodes(currentnode.children[i],i,currentnode);

      }
    }
    return flag;
   }

   onclick(name,flag){
    
   }

   onSubmit(template){
    let selectedTemplateObject = new TableRows();

    for(let i=0;i<this.templatelist.length;i++){
      if(this.templatelist[i].templateName === template){
        selectedTemplateObject = this.templatelist[i];
      }
    }

    if(!!selectedTemplateObject.templateId){
      this.error = "";
      this.router.navigate(['/user','affidavitdesc',selectedTemplateObject.templateId]);
    }else{
      this.showErrorMessage();
    }
  }
 
  showErrorMessage(){
    this.error = "* It is not a valid Affidavit "
  }

}

