var Illc = Illc || {};
Illc.Chatroom = function (editor)
{
	this.__editor = editor;
	this.__init();
}

Illc.Chatroom.prototype =
{
	__editor: null,
	__currentRoomId: null,
	__init: function __init()
	{
		//add the "Send" command
		this.__editor.addCommand('cmd_send', {
			exec: function (editor)
			{
				var data = editor.getData();
				$.ajax({
					type: "POST",
					url: "/Chat/PostMessage/",
					data: JSON.stringify({ message: data, rId: this.__currentRoomId }),
					success: function (e)
					{
						console.log("success:" + e);
					},
					dataType: "json",
					contentType: "application/json;charset=utf-8",
				});
			}
		});
		//add the "Send" button to toolbar
		this.__editor.ui.addButton('Send',
		{
			label: 'Send',
			command: 'cmd_send',
			toolbar: 'colors',
			icon: 'http://icons.iconarchive.com/icons/mazenl77/I-like-buttons-3a/512/Cute-Ball-Go-icon.png'
		});
		//set the toolbar in config
		this.__editor.config.toolbar = [
					{ name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
					{ name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
					{ name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'NumberedList', 'BulletedList', 'Blockquote', 'PageBreak', 'Link', 'Unlink'] },
					{ name: 'paragraph', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'] },
					{ name: 'editing', items: ['Find', 'Replace', '-', 'Scayt'] },
					{ name: 'colors', items: ['TextColor', 'BGColor'] },
					{ name: 'custombuttons', items: ['Send'] },
		];
	},
}