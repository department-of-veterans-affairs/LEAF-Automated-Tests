<!--{strip}-->
    <!--{if !isset($depth)}-->
    <!--{assign var='depth' value=0}-->
    <!--{/if}-->

    <!--{if $depth == 0}-->
    <!--{assign var='color' value='#e0e0e0'}-->
    <!--{else}-->
    <!--{assign var='color' value='white'}-->
    <!--{/if}-->

    <!--{if $form}-->
    <div class="printformblock">
    <!--{foreach from=$form item=indicator}-->
                <!--{if $indicator.format == null || $indicator.format == 'textarea'}-->
                <!--{assign var='colspan' value=2}-->
                <!--{else}-->
                <!--{assign var='colspan' value=1}-->
                <!--{/if}-->
        <!--{if $depth == 0}-->
      <div class="printmainblock<!--{if ($indicator.required == 0 && $indicator.data == '') || $indicator.format == 'json'}--> notrequired<!--{/if}-->">
        <div class="printmainlabel">
            <!--{if $indicator.required == 1 && $indicator.isEmpty == true}-->
                <div id="PHindicator_<!--{$indicator.indicatorID}-->" class="printheading_missing" style="cursor: pointer" onclick="orgchartForm.getForm(<!--{$uid}-->, <!--{$categoryID}-->, <!--{$indicator.indicatorID}-->);">
            <!--{else}-->
                <div id="PHindicator_<!--{$indicator.indicatorID}-->" class="printheading" style="cursor: pointer" onclick="orgchartForm.getForm(<!--{$uid}-->, <!--{$categoryID}-->, <!--{$indicator.indicatorID}-->);">
            <!--{/if}-->
            <div style="float: left">
            <!--{if $date < $indicator.timestamp && $date > 0}-->
                <img src="../libs/dynicons/?img=appointment.svg&amp;w=16" alt="View History" title="View History" style="cursor: pointer" onclick="getIndicatorLog(<!--{$indicator.indicatorID}-->); $('#histdialog1').dialog('open')" />&nbsp;
            <!--{/if}-->
            <!--{if $indicator.isWritable == 0}-->
                <img src="../libs/dynicons/?img=emblem-readonly.svg&amp;w=16" alt="Read-only" title="Read-only" />&nbsp;
            <!--{else}-->
                <img src="../libs/dynicons/?img=accessories-text-editor.svg&amp;w=16" alt="Edit this field" title="Edit this field" style="cursor: pointer" />&nbsp;
            <!--{/if}-->
            </div>
            <!--{if $indicator.isWritable == 0}-->
            <span class="printsubheading" title="indicatorID: <!--{$indicator.indicatorID}-->"><!--{$indicator.name}-->: </span>
            <!--{else}-->
            <span class="printsubheading" title="indicatorID: <!--{$indicator.indicatorID}-->"><!--{$indicator.name}-->: </span>
            <!--{/if}-->
            <span class="printResponse" id="xhrIndicator_<!--{$indicator.indicatorID}-->_<!--{$categoryID}-->_<!--{$uid}-->">
                <!--{include file="print_subindicators_ajax.tpl"}-->
            </span>

        <!--{else}-->
      <div class="printsubblock">
        <div class="printsublabel">
            <!--{if $indicator.required == 1 && $indicator.isEmpty == true}-->
                <div class="printsubheading_missing">
            <!--{else}-->
                <div class="printsubheading">
            <!--{/if}-->
            <!--{if $indicator.format == null}-->
                <span class="printsubheading" title="indicatorID: <!--{$indicator.indicatorID}-->"><!--{$indicator.name|indent:$depth:""}--></span>
            <!--{else}-->
                <span class="printsubheading" title="indicatorID: <!--{$indicator.indicatorID}-->"><!--{$indicator.name|indent:$depth:""}--></span>
            <!--{/if}-->
        <!--{/if}-->
            <br style="clear: both" />
            </div>
        </div><!-- end print sublabel -->
        </div><!-- end print block -->
        <!--{if $depth == 0}-->
        
        <!--{/if}-->
    <!--{/foreach}-->
    </div>
    <span class="tempText" style="float: right; text-decoration: underline; font-size: 80%; cursor: pointer" onclick="$('.printformblock').css('display', 'inline');$('.notrequired').css('display', 'inline');$('.tempText').css('display', 'none');">Show_all_fields</span>
    <br />
    <!--{/if}-->
<!--{/strip}-->