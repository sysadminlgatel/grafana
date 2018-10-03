# Sensu Datasource Plugin for Grafana

![Sensu](https://sensuapp.org/img/logo-horizontal.png)
[Sensu](https://sensuapp.org) is a monitoring system typically front-ended by Uchiwa.

![Grafana](http://grafana.org/assets/img/logo_new_transparent_200x48.png)

Screenshot of plugin with datatable panel:

Results can be return as a table or as JSON, this is the "table" data:
![Sensu Results as Table](https://raw.githubusercontent.com/briangann/grafana-sensu-datasource/master/src/screenshots/sensu-datasource-results-as-table.png)

This is the JSON data:
![Sensu Results as JSON](https://raw.githubusercontent.com/briangann/grafana-sensu-datasource/master/src/screenshots/sensu-datasource-results-as-json-default.png)

This is the same JSON data but will column selection:

![Sensu Results as JSON Column Selection](https://raw.githubusercontent.com/briangann/grafana-sensu-datasource/master/src/screenshots/sensu-datasource-results-as-json-select-columns.png)

Additional docs at [github.io](https://briangann.github.io/grafana-sensu-datasource)

### About this plugin
This is a datasource plugin for integrating [Grafana 3.x/4.x](https://grafana.org) and Sensu. It provides a query builder to return data about Events, Results, Aggregates, and Clients.

The query builder provides hints for each type, with two optional dimensions "Client Name" and "Check Name".

### Running with Docker
A ``docker-compose.yml`` file is provided to easily stand up a Grafana 3.x server with this datasource mapped to the container.

### Installation

* Copy/clone this repos into /var/lib/grafana/plugins
* Restarting ``grafana-server`` is required to pick up the plugin.

Once the plugin is "feature complete" a PR will be made to add this plugin to the official datasource plugins on [Grafana.net](http://grafana.net)

### Using the plugin

#### Setup datasource

And and test datasource by setting the Url to the Sensu API, typically on port 4567.

![Add and Test Datasource](https://raw.githubusercontent.com/briangann/grafana-sensu-datasource/master/src/screenshots/sensu-datasource-add.png)

#### Using the query builder

Add a new "Table" to a dashboard and select the Sensu datasource. Choosing results, you will get a "dimensions" option to narrow the dataset.

There are 5 options for the datasource:

1. Events: Returns active events (alerts)
2. Results as JSON: Returns check results in JSON format
3. Results as Table: Returns check results in Table format
4. Aggregates: Returns aggregate check states
5. Client History: Similar to Results, but with additional data
   * NOTE: this is a deprecated API but still actively used in Uchiwa

#### Dimensions

Choosing results, you will get a "dimensions" option to narrow the dataset.

![Dimensions](https://raw.githubusercontent.com/briangann/grafana-sensu-datasource/master/src/screenshots/sensu-datasource-dimensions.png)
Select the textbox for metrics, and hints will be provided:

### References

More info about Sensu [here](https://sensuapp.org).
