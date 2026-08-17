import { Pipe, PipeTransform } from '@angular/core';
import { CourtAffidavitUserResponse } from 'src/app/court/models/CourtAffidavitUserResponse';

@Pipe({
  name: 'courtAffidavitFilter'
})
export class CourtAffidavitFilterPipe implements PipeTransform {

  transform(value: CourtAffidavitUserResponse[], filterstring:string): any {
    if(value != undefined && value.length === 0)
      return value;

    if(filterstring === undefined){
      return value;
    }

    if(filterstring.length === 0)
    return value;

    const filteredarray =[];
    for(let item of value){
        if(item.customName != null && item.customName != '' ){
            if(item.customName.toLowerCase().match(filterstring.toLowerCase()))
                filteredarray.push(item);
        }else{
            if(item.temName.toLowerCase().match(filterstring.toLowerCase()))
                filteredarray.push(item);
        }

    }
    return filteredarray;
  }

}
