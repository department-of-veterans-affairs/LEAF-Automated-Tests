//const{base}

import{test as baseTest} from "@playwright/test";

type WorkflowFixture = {
    workflowData:any;
    
}

 export const test = baseTest.extend<WorkflowFixture>({
    workflowData:{
  
    uniqueText: String,
   uniqueDescr: String

   //"Random onr Test 870065a",                //`New event ${randNum}`,
   
   //" Adding some more random description 00875a"   //`Adding some random description ${randNum}`,
  // eventTitle: uniqueDescription;
    }

})



export {expect} from "@playwright/test"