import FormEntryDisplay from './FormEntryDisplay.js';
import FormIndexListing from './FormIndexListing.js';

export default {  //TODO: rename this component
    data()  {
        return {
            formID: this.currentCategorySelection.categoryID,
            dragLI_Prefix: 'index_listing_',
            dragUL_Prefix: 'drop_area_parent_',
            listItems: [],  //objects w indID, parID, newParID, sort, listindex for tracking parID and sort changes
        }
    },
    components: {
        FormEntryDisplay,
        FormIndexListing
    },
    inject: [
        'APIroot',
        'CSRFToken',
        'ajaxFormByCategoryID',
        'currSubformID',
        'selectNewCategory',
        'newQuestion',
        'currentCategorySelection',
        'currentCategoryIndicatorTotal'
    ],
    provide() {
        return {
            listItems: Vue.computed(() => this.listItems),
            addToListItemsArray: this.addToListItemsArray,
            startDrag: this.startDrag,
            onDragEnter: this.onDragEnter,
            onDragLeave: this.onDragLeave,
            onDrop: this.onDrop
        }
    },
    computed: {
        formName() {
            return this.currentCategorySelection.categoryName || 'Untitled';
        },
        allListItemsAreAdded() {
            return this.currentCategoryIndicatorTotal === this.listItems.length;
        },
        sortOrParentChanged() {
            return this.sortValuesToUpdate.length > 0 || this.parentIDsToUpdate.length > 0;
        },
        sortValuesToUpdate() {
            return this.listItems.filter(item => item.sort !== item.listIndex);
        },
        parentIDsToUpdate() {
            //NOTE: headers have null as parentID, so listitems element newParentID is initialized with ''
            return this.listItems.filter(item => item.newParentID !== '' && item.parentID !== item.newParentID);
        }
    },
    methods: {
        applySortAndParentID_Updates(){
            let updateSort = [];
            this.sortValuesToUpdate.forEach(item => {
                updateSort.push(
                    $.ajax({
                        type: 'POST',
                        url: `${this.APIroot}formEditor/${item.indicatorID}/sort`,
                        data: {
                            sort: item.listIndex,
                            CSRFToken: this.CSRFToken
                        },
                        success: () => {},
                        error: err => console.log('ind sort post err', err)
                    })
                );
            });
            let updateParentID = [];
            this.parentIDsToUpdate.forEach(item => {
                updateParentID.push(
                    $.ajax({
                        type: 'POST',
                        url: `${this.APIroot}formEditor/${item.indicatorID}/parentID`,
                        data: {
                            parentID: item.newParentID,
                            CSRFToken: this.CSRFToken
                        },
                        success: () => {},
                        error: err => console.log('ind parentID post err', err)
                    })
                );
            });

            const all = updateSort.concat(updateParentID);
            Promise.all(all).then((res)=> {
                console.log('promise all applied changes:', all, res);
                if (res.length > 0) {
                    this.selectNewCategory(this.formID, this.currSubformID !== null);
                }
            });

        },
        addToListItemsArray(formNode, parentID, listIndex) {
            const { indicatorID, sort } = formNode;
            const item = { indicatorID, sort, parentID, listIndex, newParentID: '' }
            this.listItems = [...this.listItems, item];
        },
        //update the listIndex and parentID values for a specific indicator
        updateListItems(indID, formParIndID, listIndex) {
            const item = this.listItems.find(li => li.indicatorID === indID);
            const index = this.listItems.indexOf(item);
            this.listItems = [...this.listItems.slice(0, index), ...this.listItems.slice(index + 1)];

            item.newParentID = formParIndID;
            item.listIndex = listIndex;
            this.listItems = [...this.listItems, item];
        },
        startDrag(evt) {
            evt.dataTransfer.dropEffect = 'move';
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('text/plain', evt.target.id);
        },
        onDrop(evt) {
            evt.preventDefault();
            const draggedElID = evt.dataTransfer.getData('text');
            const parentEl = evt.currentTarget; //drop event is on the parent ul

            const indID = parseInt(draggedElID.replace(this.dragLI_Prefix, ''));
            const formParIndID = parentEl.id === "base_drop_area" ? null : parseInt(parentEl.id.replace(this.dragUL_Prefix, ''));

            const elsLI = Array.from(document.querySelectorAll(`#${parentEl.id} > li`));
            if (elsLI.length===0) { //if the drop ul has no lis, just append it
                parentEl.append(document.getElementById(draggedElID));
                this.updateListItems(indID, formParIndID, 0);
                
            } else { //otherwise, find the closest li to the droppoint to insert before
                let dist = 9999;
                let closestLI_id = null;
                elsLI.forEach(el => {
                    const newDist = el.getBoundingClientRect().top - evt.clientY;
                    if(el.id !== draggedElID && newDist > 0 && newDist < dist) {
                        dist = newDist;
                        closestLI_id = el.id;
                    }
                });
            
                try {
                    if(closestLI_id !== null) {
                        parentEl.insertBefore(document.getElementById(draggedElID), document.getElementById(closestLI_id));
                    } else {
                        console.log('got a null id');
                    }
                    //check the new indexes
                    const newElsLI = Array.from(document.querySelectorAll(`#${parentEl.id} > li`));
                    newElsLI.forEach((li,i) => {
                        const indID = parseInt(li.id.replace(this.dragLI_Prefix, ''));
                        this.updateListItems(indID, formParIndID, i);
                    });
                    
                } catch(error) {
                    console.log(error);
                }
            }
            if(parentEl.classList.contains('entered-drop-zone')){
                evt.target.classList.remove('entered-drop-zone');
            }
        },
        onDragLeave(evt) { //@dragleave="onDragLeave"
            if(evt.target.classList.contains('form-index-listing-ul')){
               //if target is ul, rm drop zone hilite
                evt.target.classList.remove('entered-drop-zone');
            }
        },
        onDragEnter(evt) {
            if(evt.target.classList.contains('form-index-listing-ul')){
                //if target is ul, apply style to hilite drop zone
                evt.target.classList.add('entered-drop-zone');
            }
        }
    },
    watch: {
        allListItemsAreAdded(newVal, oldVal){
            console.log('watch triggered, all items have been added');
            if(newVal===true) {
                //update legacy sort to from prev sort val to new index based value.  NOTE: possibly just use manual 'apply changes' btn
                if (this.sortValuesToUpdate.length > 0) {
                    let updateSort = [];
                    this.sortValuesToUpdate.forEach(item => {
                        updateSort.push(
                            $.ajax({
                                type: 'POST',
                                url: `${this.APIroot}formEditor/${item.indicatorID}/sort`,
                                data: {
                                    sort: item.listIndex,
                                    CSRFToken: this.CSRFToken
                                },
                                success: () => {},
                                error: err => console.log('ind sort post err', err)
                            })
                        );
                    });
                    Promise.all(updateSort).then((res)=> {
                        console.log('promise all:', updateSort, res);
                        if (res.length > 0) {
                            this.selectNewCategory(this.formID, this.currSubformID !== null);
                        }
                    });
                }
            }
        }
    },
    template:`
    <div style="display:flex;">
        <!-- FORM INDEX DISPLAY -->
        <div id="form_index_display">
            <div v-if="sortOrParentChanged" id="can_update" 
            tabindex="0" @click="applySortAndParentID_Updates"
            title="Apply form structure updates">Apply changes</div>
            <div v-else id="can_update" title="drag and drop sections and apply updates to change form structure">ℹ</div>

            <h3 style="margin: 0; margin-bottom: 0.5em; color: black;" :title="formName">
            {{ formName }}
            </h3>
            <ul v-if="ajaxFormByCategoryID.length > 0"
                id="base_drop_area"
                class="form-index-listing-ul"
                data-effect-allowed="move"
                @drop.stop="onDrop"
                @dragover.prevent
                @dragenter.prevent="onDragEnter"
                @dragleave="onDragLeave">

                <form-index-listing v-for="(formSection, i) in ajaxFormByCategoryID"
                    :id="'index_listing_'+formSection.indicatorID"
                    :depth=0
                    :formNode="formSection"
                    :index=i
                    :parentID=null
                    :key="'index_list_item_' + formSection.indicatorID"
                    draggable="true"
                    @dragstart.stop="startDrag">
                </form-index-listing>
            </ul>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 1em;">
                <button class="btn-general" style="width: 100%" @click="newQuestion(null)">+ Add Section</button>
            </div>
        </div>

        <!-- FORM ENTRY DISPLAY -->
        <div style="display:flex; flex-direction: column; width: 100%; background-color: white; border: 1px solid black; min-width: 400px;">
            <template v-if="ajaxFormByCategoryID.length > 0">
                <template v-for="(formSection, i) in ajaxFormByCategoryID">
                    <div class="printformblock">
                        <form-entry-display 
                            :depth="0"
                            :formNode="formSection"
                            :index="i"
                            :key="formSection.indicatorID">
                        </form-entry-display>
                    </div>
                </template>
            </template>
        </div>
    </div>`
}