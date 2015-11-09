#!/usr/bin/env python
import wx
import wx.combo
import wx.dataview as dv
import testData

class MainFrame(wx.Frame):
    """Main Frame"""
    
    def __init__(self,parent=None,id=-1,size=(640,480)):
        """Init the main frame"""
        wx.Frame.__init__(self,parent,id,"Toolbars",size=size)
        panel=wx.Panel(parent=self)
        panel.SetBackgroundColour('red')
        statusbar=self.CreateStatusBar()
        tb=wx.ToolBar(self)
        tsize = (24,24)
        new_bmp =  wx.ArtProvider.GetBitmap(wx.ART_NEW, wx.ART_TOOLBAR, tsize)
        open_bmp = wx.ArtProvider.GetBitmap(wx.ART_FILE_OPEN, wx.ART_TOOLBAR, tsize)
        copy_bmp = wx.ArtProvider.GetBitmap(wx.ART_COPY, wx.ART_TOOLBAR, tsize)
        paste_bmp= wx.ArtProvider.GetBitmap(wx.ART_PASTE, wx.ART_TOOLBAR, tsize)

        tid=wx.NewId()
        tb.SetToolBitmapSize(tsize)
        tb.AddLabelTool(tid, "Search Local Network", new_bmp, shortHelp="Search Local Network", longHelp="Search local network to find other clients.")
        self.Bind(wx.EVT_TOOL, self.OnToolClick, id=tid)
        self.Bind(wx.EVT_TOOL_RCLICKED, self.OnToolRClick, id=tid)
        tid=wx.NewId()
        tb.AddLabelTool(tid, "Connect to IP address", open_bmp, shortHelp="Connect to IP address", longHelp="Connect to client on a given IP address.")
        tb.AddSeparator()
        tb.AddLabelTool(wx.NewId(), "Chatroom", copy_bmp, open_bmp, shortHelp="Connect to Chatroom", longHelp="Connect to Chatroom.")
        tb.AddSeparator()
        cbID = wx.NewId()
        tb.AddControl(
            wx.combo.BitmapComboBox(
                tb, cbID, "", choices=["", "This", "is a", "wx.ComboBox"],
                size=(150,-1), style=wx.CB_DROPDOWN
                ))

        
        # Final thing to do for a toolbar is call the Realize() method. This
        # causes it to render (more or less, that is).
        tb.Realize()
        self.SetToolBar(tb)
        menuBar=wx.MenuBar()
        menu1=wx.Menu()
        menuBar.Append(menu1,"&File")
        menu2=wx.Menu()
        menu2.Append(wx.NewId(),"&Copy","Copy in status bar")
        menu2.Append(wx.NewId(),"C&ut","")
        menu2.Append(wx.NewId(),"Paste","")
        menu2.AppendSeparator()
        menu2.Append(wx.NewId(),"&Options...","Display options")
        menuBar.Append(menu2,"&Edit")
        self.SetMenuBar(menuBar)
        self.__dataList=self.__createClientList(panel)
        
        #box = wx.StaticBox(panel, -1, "Clients:")
        #bsizer = wx.StaticBoxSizer(box, wx.VERTICAL)
        #bsizer.Add(self.__dataList, 1, wx.EXPAND)
        
        # Set the layout so the listctrl fills the panel
        sizer = wx.BoxSizer()
        sizer.Add(panel, 1, wx.EXPAND)
        self.Fit()
        sizer=wx.BoxSizer()
        sizer.Add(self.__dataList, 1, wx.EXPAND)


        panel.SetSizer(sizer)
        #panel.Fit()
        #sizer = wx.BoxSizer()
        #sizer.Add(self.__dataList, 1, wx.EXPAND)
        #panel.SetSizer(sizer)
        
        self.Center()
        self.SetAutoLayout(True)

    def __createClientList(self,parent):
        """create the listctrl that contains client data"""
        dvlc = dv.DataViewListCtrl(parent)

        dvlc.AppendTextColumn('IP', width=200)
        dvlc.AppendTextColumn('Hostname', width=170)
        #list=wx.ListCtrl(parent)
        #list.InsertColumn(0,"IP")
        #list.InsertColumn(1,"Hostname")
        
        #for i in range(len(testData.clientsData)):
        #    list.InsertStringItem(i,0,testData.clientsData[i][0])
        #    list.InsertStringItem(i,1,testData.clientsData[i][1])
        #    list.SetItemData(i,i)

        #list.SetColumnWidth(0, wx.LIST_AUTOSIZE)
        #list.SetColumnWidth(1, wx.LIST_AUTOSIZE)
        return dvlc
    
    def OnCloseMe(self,event):
        self.Close(True)

    def OnCloseWindow(self,event):
        self.Destroy()

    def OnToolClick(self,event):
        pass

    def OnToolRClick(self,event):
        pass

#class App(wx.App):

#    def OnInit(self):
#        image=wx.Image('wxPython.jpg',wx.BITMAP_TYPE_JPEG)
#        self.frame=Frame(image)
#        self.frame.Show()
#        self.SetTopWindow(self.frame)
#        return True

if __name__=='__main__':
    app=wx.PySimpleApp()
    frame=MainFrame()
    frame.Show()
    app.MainLoop();