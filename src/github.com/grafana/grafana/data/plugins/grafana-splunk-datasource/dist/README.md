# Splunk Datasource

## Configuration

### Data Source Config
When configuring the Data Source, ensure the URL field utilizes `https` and points to the your configured Splunk port. The default Splunk API point is 8089, not 8000 (this is default web UI port). Enable _Basic Auth_ and specify Splunk username and password.

#### Direct access mode and CORS
If you are using CORS, you'll need to configure the Splunk server to allow Grafana to communicate with it 
using a CORS connection. To do this, add your web site's address as a trusted HTTP origin 
to the crossOriginSharingPolicy attribute in the server.conf configuration file.

For example, add this stanza to the $SPLUNK_HOME/etc/system/local/server.conf configuration file, then restart Splunk:
```
[httpServer]
crossOriginSharingPolicy = http://localhost:3000
```
See more info in original article [Communicate with the Splunk server for apps outside of Splunk Web](http://dev.splunk.com/view/webframework-developapps/SP-CAAAEW6)

**Note:** we don't recommend to use direct access. It almost always is better to connect to Splunk via Grafana backend in proxy mode.
Use direct only if you really need it and know how it works.

![ds config](https://cloud.githubusercontent.com/assets/4932851/22745094/6b5bedd0-ee30-11e6-9f6f-2aa40c31a130.png)

### Advanced options

![ds config advanced](https://cloud.githubusercontent.com/assets/4932851/22939222/0f4732c0-f2ef-11e6-894b-37f5a731dcac.png)

#### Stream Mode
Enable stream mode if you want to get search results as they become available.  
**Note!!!** This is experimental feature, don't enable it until you really need it.

#### Search polling interval
This option allow to adjust how often Grafana will poll splunk for search results. Time for next poll choosing randomly from [min, max) interval. If you run a lot of heavy searches, it makes sense to increase these values. Tips: increase _Min_ if search jobs execution takes a long time, and _Max_ if you run a lot of parallel searches (a lot of splunk metrics on Grafana dashboard).
Default is [500, 3000) milliseconds interval.

#### Auto cancel
If specified, the job automatically cancels after this many seconds of inactivity (0 means never auto-cancel). Default is 30.

#### Status buckets
The most status buckets to generate. 0 indicates to not generate timeline information. Default is 300.

#### Fields search mode
When you use visual query editor, data source attempts to get list of available fields for selected source type.
- quick - use first available result from preview
- full - wait for job finish and get full result.

#### Default earliest time
Some searches can't use dashboard time range (such as template variable queries). This option helps to prevent search for all time, which can slow down Splunk. The syntax is an integer and a time unit `[+|-]<time_integer><time_unit>`. For example `-1w`. [Time unit](http://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch) can be `s, m, h, d, w, mon, q, y`.

## Usage

### Query editor

#### Editor modes
Query editor support two modes: raw and visual. To switch between these modes click hamburger icon at the right side of editor and select _Toggle Editor Mode_.

#### Raw mode
Use `timechart` command for timeseries data. For example:
```
index=os sourcetype=cpu | timechart span=1m avg(pctSystem) as system, avg(pctUser) as user, avg(pctIowait) as iowait
index=os sourcetype=ps | timechart span=1m limit=5 useother=false avg(cpu_load_percent) by process_name
```

Queries support template variables:
```
sourcetype=cpu | timechart span=1m avg($cpu)
```

Keep in mind that Grafna is timeseries-oriented application and your search should return timeseries data (timestamp and value) or single value. You can read about [timechart](http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Timechart) command and find more search examples in official [Splunk Search Reference](http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/WhatsInThisManual)

#### Format as
There are two supported result format modes - _Time series_ (default) and _Table_. Table mode suitable for using with Table panel when you want to display aggregated data. That works with raw events (returns all selected fields) and `stats` search function, which returns table-like data. Examples:
```
index="os" sourcetype="vmstat" | fields host, memUsedMB
index="os" sourcetype="ps" | stats avg(PercentProcessorTime) as "CPU time", latest(process_name) as "Process", avg(UsedBytes) as "Memory" by PID
```
Result is similar to _Statistics_ tab in Splunk UI.
![Grafana table](https://cloud.githubusercontent.com/assets/4932851/22940242/4dbcff96-f2f2-11e6-981a-e2730abdea29.png)
![Splunk statistics](https://cloud.githubusercontent.com/assets/4932851/22940241/4db0f5c0-f2f2-11e6-9fad-f8a9689b8c1f.png)

Read more about `stats` function usage in [Splunk Search Reference](http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Stats)

#### Visual mode
![query editor](https://cloud.githubusercontent.com/assets/4932851/22550064/5d146ad4-e95f-11e6-96c2-babb3855eb16.png)
This mode provide easy to use step-by-step search creating. Note, that this mode creates `timechart` splunk search. Just select index, source type, and metrics, and set split by fields if you want. 

##### Metric
You can add multiple metrics to search by clicking _plus_ button at the right side of metric row. Metric editor contains list of frequently used aggregations, but you can specify here any other function. Just click on agg segment (`avg` by default) and type what you need. Select interested field from dropdonw (or type) and set alias if you want.

##### Split by and Where
![split by and where](https://cloud.githubusercontent.com/assets/4932851/22550932/8009762a-e963-11e6-8bcf-b7870a24ff1d.png)

If you set Split by field and use _Time series_ mode, Where editor will be available. Click _plus_ and select operator, aggregation and value, for example _Where avg in top 10_.
Note, this _Where_ clause is a part of _Split by_. See more at [timechart docs](http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/timechart#where_clause).

#### Options
To change default timechart options, click _Options_ at last row:
![query options](https://cloud.githubusercontent.com/assets/4932851/22550065/5d2b909c-e95f-11e6-8453-61fb20938b36.png)
See more about these options in [timechart docs](http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/timechart).

#### Rendered splunk search
Click on target letter at the left to collapse editor and show rendered splunk search.

### Annotations
![annotations editor](https://cloud.githubusercontent.com/assets/4932851/22551697/dd757388-e966-11e6-9274-fface3657cf1.png)
Use annotations if you want to show Splunk alerts or events on graph.
Annotation can be either predefined Splunk alert or regular splunk search.

#### Splunk alert
Specify alert name or leave field blank to get all fired alerts. Template variables are supported.

#### Splunk search
Use splunk search to get needed events, for example:
```
index=os sourcetype=iostat | where total_ops > 400
index=os sourcetype=iostat | where total_ops > $io_threshold
```
Template variables are supported.

**Event field as text** option suitable if you want to use field value as annotation text. For example, error message text from logs:
```
Event field as text: _raw
Regex: WirelessRadioManagerd\[\d*\]: (.*)
```
Regex allows to extract a part of message.

### Templating
Now templating feature supports Splunk queries which return list of values, for example with `stats`command:
```
index=os sourcetype="iostat" | stats values(Device)
```
This query returns list of `Device` field values from `iostat` source. Then you can use these device names for timeseries queries or annotations.
