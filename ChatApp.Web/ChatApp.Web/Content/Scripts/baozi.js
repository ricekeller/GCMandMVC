$(document).ready(
	function ()
	{
		//constants
		var collectionName = "order";

		//global variables
		var newRowIdx = 0;
		var lastSelectedItem = null;

		//process baozi data
		var tmp = {};
		for (var i = 0; i < baozi_data.length; i++)
		{
			tmp[baozi_data[i].Id] = baozi_data[i];
		}
		baozi_data = tmp;

		//jquery ui
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
		$("#baozi_date").menu({
			select: function (event,ui)
			{
				var id = $(ui.item).attr("data-baoziid");
				if (lastSelectedItem && id === $(lastSelectedItem).attr("data-baoziid"))
				{
					return;
				}
				//change style
				if (lastSelectedItem)
				{
					$(lastSelectedItem).removeClass("itemSelected");
				}
				$(ui.item).addClass("itemSelected");
				lastSelectedItem = ui.item;

				//get data
				if(id)
				{
					var data = baozi_data[id];
					//clear and set data
					SetDataToDisplayInTbl(data)
				}
			},
		});
		$("#baozi_date li:first").click();

		//style table
		(function ($)
		{
			$.fn.styleTable = function (options)
			{
				var defaults = {
					css: 'ui-styled-table'
				};
				options = $.extend(defaults, options);

				return this.each(function ()
				{
					$this = $(this);
					$this.addClass(options.css);

					$this.on('mouseover mouseout', 'tbody tr', function (event)
					{
						$(this).children().toggleClass("ui-state-hover",
													   event.type == 'mouseover');
					});

					$this.find("th").addClass("ui-state-default");
					$this.find("td").addClass("ui-widget-content");
					$this.find("tr:last-child").addClass("last-child");
				});
			};
		})(jQuery);
		$("table").styleTable();

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
		function SetDataToDisplayInTbl(data)
		{
			var tb = $("#tbody_baozi");
			tb.empty();
			var newDate=new Date(parseInt(data.OrderDate.substring(6)));
			$("#order_date").text(newDate.toLocaleString());

			$.each(data.Entries, function (key, val)
			{
				tb.append("<tr><td class='ui-widget-content'>" + val.Buyer +
				"</td><td class='ui-widget-content'>" + val.Quantity + "</td></tr>");
			});
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