package com.ricekeller.illclxx.gcmclient;


import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentTabHost;
import android.support.v4.app.FragmentTransaction;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TabHost;


public class MainActivity extends FragmentActivity implements TabHost.OnTabChangeListener {

    private static String TAG=MainActivity.class.toString();
    private FragmentTabHost mTabHost;
    private Fragment mCur;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initialiseTabHost(savedInstanceState);
    }

    private void initialiseTabHost(Bundle args) {
        mTabHost = (FragmentTabHost)findViewById(android.R.id.tabhost);
        mTabHost.setup(this,getSupportFragmentManager(),android.R.id.tabcontent);
        mTabHost.clearAllTabs();
        FragmentTabHost.TabSpec tab= mTabHost.newTabSpec("tab1").setIndicator("tab_1");
        mTabHost.addTab(tab,TabFragment.class,null);
        tab= mTabHost.newTabSpec("tab2").setIndicator("tab2");
        mTabHost.addTab(tab,TabFragment.class,null);
        tab= mTabHost.newTabSpec("tab3").setIndicator("tab3");
        mTabHost.addTab(tab,TabFragment.class,null);
        // Default to first tab
        this.onTabChanged("tab1");
        //
        mTabHost.setOnTabChangedListener(this);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onTabChanged(String tabId)
    {
        FragmentTransaction ft=getSupportFragmentManager().beginTransaction();
        //if(null!=mCur) ft.detach(mCur);
        if(tabId.equals("tab2"))
        {
            ft.replace(android.R.id.tabcontent, Fragment.instantiate(this, TabFragment.class.getName()));
        }
        else if(tabId.equals("tab3"))
        {
            ft.replace(android.R.id.tabcontent, Fragment.instantiate(this, TestFragment.class.getName()));
        }

        ft.commit();
        this.getSupportFragmentManager().executePendingTransactions();
    }
}
