export default {
    name: 'FormEditingDisplay',  //NOTE: this will replace previous 'print-subindicators' component
    data() {
        return {
            showToolbar: false
        }
    },
    props: {
        depth: Number,
        formNode: Object,
        index: Number
    },
    inject: [
        'truncateText',
        'newQuestion',
        'getForm',
        'editIndicatorPrivileges',
        'gridInstances',
        'updateGridInstances',
        'listItems',
        'allListItemsAreAdded',
        'allowedConditionChildFormats'
    ],
    methods: {
        ifthenUpdateIndicatorID(indicatorID) {
            vueData.indicatorID = parseInt(indicatorID); //NOTE: TODO: possible better way
            document.getElementById('btn-vue-update-trigger').dispatchEvent(new Event("click"));
        },
        toggleEditArea(event) {
            event.stopPropagation();
            if (event?.keyCode===32) event.preventDefault();
            this.showToolbar=!this.showToolbar;
        },
    },
    computed: {
        hasChildNode() {
            const { child } = this.formNode;
            return child !== null && Object.keys(child).length > 0;
        },
        children() {
            let eles = [];
            if(this.hasChildNode) {
                for (let c in this.formNode.child) {
                    eles.push(this.formNode.child[c]);
                }
                eles = eles.sort((a, b)=> a.sort - b.sort);
            }
            return eles;
        },
        isHeaderLocation() {
            let ID = parseInt(this.formNode.indicatorID);
            let item = this.listItems[ID];
            return this.allListItemsAreAdded && (item.parentID===null || item.newParentID===null);
        },
        sensitiveImg() {
            return parseInt(this.formNode.is_sensitive)===1 ? 
                `<img src="../../libs/dynicons/?img=eye_invisible.svg&amp;w=16" alt=""
                    style="vertical-align:text-bottom; padding: 0.2em; align-self: flex-center"
                    title="This field is sensitive" />` : '';
        },
        formatPreview() {
            const baseFormat = this.formNode.format;
            console.log(baseFormat);

            let preview = ``;
            switch(baseFormat) {
                case 'number':
                case 'text':
                case 'currency':
                    const type = baseFormat === 'currency' ? 'number' : baseFormat;
                    preview += `<input type="${type}" ${baseFormat === 'currency' ? 'min="0.00" step="0.01"' : ''} class="text_input_preview"/>`
                    break;
                default:
                    break;

            }
            return preview;
        },
        conditionallyShown() {
            let isConditionalShow = false;
            if(this.depth !== 0 && this.formNode.conditions !== null && this.formNode.conditions !== '') {
                const conditions = JSON.parse(this.formNode.conditions) || [];
                if (conditions.some(c => c.selectedOutcome?.toLowerCase() === 'show')) {
                    isConditionalShow = true;
                }
            }
            return isConditionalShow;
        },
        consitionsAllowed() {
            return !this.isHeaderLocation && this.allowedConditionChildFormats.includes(this.formNode.format?.toLowerCase());
        },
        indicatorName() {
            let name = XSSHelpers.stripAllTags(this.formNode.name) || '[ blank ]';
            name = parseInt(this.depth) === 0 || this.index===-1 ? this.truncateText(name, 70) : name;
            return name;
        },
        bgColor() {
            return `rgb(${255-2*this.depth},${255-2*this.depth},${255-2*this.depth})`;
        },
        suffix() {
            return `${this.formNode.indicatorID}_${this.formNode.series}`;
        },
        colspan() {
            return this.formNode.format === null || this.formNode.format.toLowerCase() === 'textarea' ? 2 : 1;
        },
        required() {
            return parseInt(this.formNode.required) === 1;
        },
        isEmpty() {
            return this.formNode.isEmpty === true;
        },
        blockID() { //NOTE: not sure about empty id attr
            return parseInt(this.depth) === 0 ?  '' : `subIndicator_${this.suffix}`;
        },
        labelID() {
            return parseInt(this.depth) === 0 ? `PHindicator_${this.suffix}` : '';
        },
        labelClass() {
            if (parseInt(this.depth) === 0) {
                return this.required && this.isEmpty ? `printheading_missing` : `printheading`;
            } else {
                return this.required && this.isEmpty ? `printsubheading_missing` : `printsubheading`;
            }
        },
        truncatedOptions() {
            return this.formNode.options?.slice(0, 6) || [];
        }
    },
    mounted(){
        if(this.formNode.format==='grid') {
            const options = JSON.parse(this.formNode.options[0]);
            this.updateGridInstances(options, this.formNode.indicatorID, this.formNode.series);
            this.gridInstances[this.formNode.indicatorID].preview();
        }
    },
    template:`<div class="printResponse" :id="'xhrIndicator_' + suffix" :style="{minHeight: depth===0 ? '50px': 0}">

            <!-- NOTE: EDITING AREA -->
            <div class="form_editing_area" :class="{'conditional-show': conditionallyShown}">

                <!-- PREVIEW QUESTION AND ENTRY FORMAT -->
                <div tabindex="0" title="click or press space or enter to access tools"
                    @click.stop="toggleEditArea($event)"
                    @keypress.enter.space="toggleEditArea($event)"
                    style="display: flex; padding: 0.2em 1em; cursor: pointer;">
                    <span class="indicator-name-preview" v-html="formNode.name || '[blank]'"></span>
                </div>

                <div v-if="formNode.format!==''" class="form_data_entry_preview">
                    <template v-if="formatPreview!==''">
                    <div v-html="formatPreview" class="format-preview"></div>
                    </template>

                    <!-- NOTE:/TODO: OLD FORMAT PREVIEWS -->
                    <template v-if="formNode.format==='grid'">
                        <br />
                        <div :id="'grid'+ suffix" style="width: 100%; max-width: 100%;"></div>
                    </template>
                    <template v-else>
                        <ul v-if="formNode.options && formNode.options !== ''" style="padding-left:26px;">
                            <li v-for="o in truncatedOptions" :key="o">{{o}}</li>
                            <li v-if="formNode.options !== '' && formNode.options.length > 6">...</li>
                        </ul>
                    </template>
                </div>

                <!-- TOOLBAR -->
                <div v-show="showToolbar" :id="'form_editing_toolbar_' + formNode.indicatorID">
                    <div>
                        <span tabindex="0" style="cursor: pointer;"
                            @click="getForm(formNode.indicatorID, formNode.series)"
                            @keypress.enter="getForm(formNode.indicatorID, formNode.series)"
                            :title="'edit indicator ' + formNode.indicatorID">
                            📝
                        </span>
                        format: {{formNode.format || 'none'}}
                    </div>

                    <div style="display: flex; align-items:center;">
                        <button v-if="consitionsAllowed" :id="'edit_conditions_' + formNode.indicatorID" 
                            @click="ifthenUpdateIndicatorID(formNode.indicatorID)" :title="'Edit conditions for ' + formNode.indicatorID" class="icon">
                            <img src="../../libs/dynicons/?img=preferences-system.svg&amp;w=20" alt="" />
                        </button>
                        <button @click="editIndicatorPrivileges(formNode.indicatorID)"
                            :title="'Edit indicator ' + formNode.indicatorID + ' privileges'" class="icon">
                            <img src="../../libs/dynicons/?img=emblem-readonly.svg&amp;w=20" alt=""/> 
                        </button>

                        <button v-if="formNode.has_code" title="Advanced Options present" class="icon">
                            <img v-if="formNode.has_code" src="../../libs/dynicons/?img=document-properties.svg&amp;w=20" alt="" />
                        </button>
                        <button class="btn-general add-subquestion" title="Add Sub-question"
                            @click="newQuestion(formNode.indicatorID)">
                            + Add Sub-question
                        </button>
                    </div>
                </div>
            </div>

            <!-- NOTE: RECURSIVE SUBQUESTIONS -->
            <template v-if="hasChildNode">
                <form-editing-display v-for="child in children"
                    :depth="depth + 1"
                    :formNode="child"
                    :key="'editing_display_' + child.indicatorID"> 
                </form-editing-display>
            </template>
        </div>`
}