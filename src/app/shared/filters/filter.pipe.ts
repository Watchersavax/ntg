import { Pipe, PipeTransform } from '@angular/core';
import { TableRows } from '../models/TableRows';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: TableRows[], filterstring:string): any {
    if(value != undefined && value.length === 0)
      return value;

    if(filterstring === undefined){
      return value;
    }

    if(filterstring.length === 0)
    return value;

    const filteredarray =[];
    for(let item of value){
      if(item.templateName.toLowerCase().match(filterstring.toLowerCase()))
        filteredarray.push(item);
    }
    return filteredarray;
  }

}
