$(document).ready(
	function ()
	{
		//constants
		var collectionName = "order";

		//global variables
		var newRowIdx = 0;
		$("#div_addBaozi").dialog({
			autoOpen: false,
			resizable: false,
			height: 400,
			width: 600,
			modal: true,
			buttons: {
				"Submit": function ()
				{
					$("#div_addBaozi form").submit();
				},
				Cancel: function ()
				{
					$(this).dialog("close");
				}
			}
		});

		//hook up events
		$("#btn_addNewBaozi").click(function ()
		{
			if (getRowCntOfFormTbl() === 0)
			{
				addRowToFormTbl(-1);
			}
			$("#div_addBaozi").dialog("open");
		});
		hookupTableEvents();

		//functions
		function getRowCntOfFormTbl()
		{
			return $("#tbl_baozi tr").length;
		}
		function addRowToFormTbl(currentRowIdx)
		{
			var str = '<tr id="' + 'tr' + newRowIdx + '" class="baoziRow" data-index=' + newRowIdx + '>' +
					'<input type="hidden" name=' + collectionName + ".Index" + ' value="' + newRowIdx + '" />' +
					'<td class="buyer_cell">' +
						'<input type="text" name=' + collectionName + '[' + newRowIdx + '].Buyer />' +
					'</td>' +
					'<td class="quantity_cell">' +
						'<input type="text" name=' + collectionName + '[' + newRowIdx + '].Quantity />' +
					'</td>' +
					'<td class="rowCommands">' +
						'<div class="btn_add" data-index="' + newRowIdx + '">' +
							'<img src="/Content/Images/add.png" />' +
						'</div>' +
						'<div class="btn_remove" data-index="' + newRowIdx + '">' +
							'<img src="/Content/Images/remove.png" />' +
						'</div>' +
					'</td>' +
				'</tr>';
			if (newRowIdx === 0)
			{
				$("#tbl_baozi tbody").append(str);
			}
			else
			{
				$('#tr' + currentRowIdx).after(str);
			}
			hookupTableEvents();
			newRowIdx++;
		}
		function hookupTableEvents()
		{
			$(".btn_add").unbind("click").click(function ()
			{
				var idx = parseInt($(this).attr("data-index"), 10);
				addRowToFormTbl(idx);
			});
			$(".btn_remove").unbind("click").click(function ()
			{
				var idx = parseInt($(this).attr("data-index"), 10);
				$("#tr" + idx).remove();
			});
		}
	}
);