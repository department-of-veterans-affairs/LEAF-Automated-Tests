export default {
    data() {
        return {
            name: this.cell?.name || 'No title',
            id: this.cell?.id || this.makeColumnID(),
            gridType: this.cell?.type || 'text',
            textareaDropOptions: this.cell?.options?.join('\n') || '',
        }
    },
    props: {
        cell: Object,
        column: Number
    },
    inject: [
        'gridJSON',
        'updateGridJSON'
    ],
    methods: {
        /**
         * Purpose: Generates Unique ID to track columns to update user input with grid format
         * @returns {string}
         */
        makeColumnID() {
            return "col_" + (((1 + Math.random())*0x10000)|0).toString(16).substring(1);
        },
        /**
         * Purpose: Delete a column from Grid
         * @param event
         */
        deleteColumn(event){
            console.log('app clicked del col')
            let column = $(event.target).closest('div');
            let tbody = $(event.target).closest('div').parent('div');
            let columnDeleted = parseInt($(column).index()) + 1;
            let focus;
            switch(tbody.find('div').length){
                case 1:
                    alert('Cannot remove initial column.');
                    break;
                case 2:
                    column.remove();
                    focus = $('div.cell:first');
                    this.rightArrows(tbody.find('div'), false);
                    this.leftArrows(tbody.find('div'), false);
                    break;
                default:
                    focus = column.next().find('[title="Delete column"]');
                    if(column.find('[title="Move column right"]').css('display') === 'none'){
                        this.rightArrows(column.prev(), false);
                        this.leftArrows(column.prev(), true);
                        focus = column.prev().find('[title="Delete column"]');
                    }
                    if(column.find('[title="Move column left"]').css('display') === 'none'){
                        this.leftArrows(column.next(), false);
                        this.rightArrows(column.next(), true);
                    }
                    column.remove();
                    break;
            }
            $('#tableStatus').attr('aria-label', 'Row ' + columnDeleted + ' removed, ' + $(tbody).children().length + ' total.');
            focus.focus();
            this.updateGridJSON();
        },
        /**
         * Purpose: Move Column Right
         * @param event
         */
        moveRight(event) {
            let column = $(event.target).closest('div.cell');
            let nextColumn = column.next().find('[title="Move column right"]');
            
            column.insertAfter(column.next());
            if(nextColumn.length===0) {
                column.find('[title="Move column left"]').focus();
            } else {
                column.find('[title="Move column right"]').focus();
            }
            $('#tableStatus').attr('aria-label', 'Moved right to column ' + (parseInt($(column).index()) + 1) + ' of ' + column.parent().children().length);
            this.updateGridJSON();
        },
        /**
         * Purpose: Move Column Left
         * @param event
         */
        moveLeft(event) {
            let column = $(event.target).closest('div.cell');
            let nextColumn = column.prev().find('[title="Move column left"]');

            column.insertBefore(column.prev());
            setTimeout(()=> {  //need to clear stack for left
                if(nextColumn.length===0) {
                    column.find('[title="Move column right"]').focus();
                } else {
                    column.find('[title="Move column left"]').focus();
                }
            }, 0);
            $('#tableStatus').attr('aria-label', 'Moved left to column ' + (parseInt($(column).index()) + 1) + ' of ' + column.parent().children().length);
            this.updateGridJSON();
        },

    },
    template:`<div :id="id" class="cell">
        <img v-if="column!==1" role="button" tabindex="0"
            @click="moveLeft" @keypress.space.enter.prevent="moveLeft"
            src="../../libs/dynicons/?img=go-previous.svg&w=16" 
            title="Move column left" alt="Move column left" style="cursor: pointer" />
        <img v-if="column!==gridJSON.length" role="button" tabindex="0" 
            @click="moveRight"  @keypress.space.enter.prevent="moveRight" 
            src="../../libs/dynicons/?img=go-next.svg&w=16" 
            title="Move column right" alt="Move column right" style="cursor: pointer" /><br />
        <span class="columnNumber">
            <span>Column #{{column}}:</span>
            <img role="button" tabindex="0"
            @click="deleteColumn" @keypress.space.enter.prevent="deleteColumn"
            src="../../libs/dynicons/?img=process-stop.svg&w=16" 
            title="Delete column" alt="Delete column" />
        </span>
        <label :for="'gridcell_title_' + id">Title:</label>
        <input type="text" v-model="name" :id="'gridcell_title_' + id" />
        <label :for="'gridcell_type_' + id">Type:</label>
        <select v-model="gridType" :id="'gridcell_type_' + id">
            <option value="text">Single line input</option>
            <option value="date">Date</option>
            <option value="dropdown">Drop Down</option>
            <option value="textarea">Multi-line text</option>
        </select>
        <span v-if="gridType==='dropdown'" class="dropdown">
            <label for="'gridcell_options_' + id">One option per line</label>
            <textarea :id="'gridcell_options_' + id" 
                v-model="textareaDropOptions"
                aria-label="Dropdown options, one option per line"
                style="width: 100%; height: 60px; resize:vertical">
            </textarea>
        </span>
    </div>`
}