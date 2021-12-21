# node-red-contrib-accesscontrol-nocontext
[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![npm version](https://badge.fury.io/js/node-red-contrib-accesscontrol-nocontext.svg)](https://badge.fury.io/js/node-red-contrib-accesscontrol-nocontext)
![Test workflow](https://github.com/edogimo/node-red-contrib-accesscontrol-nocontext/actions/workflows/github-actions-general.yml/badge.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/EdoGimo/node-red-contrib-accesscontrol-nocontext/graphs/commit-activity)
[![vulnerabilities Status](https://snyk.io/test/github/edogimo/node-red-contrib-accesscontrol-nocontext/badge.svg)](https://snyk.io/test/github/edogimo/node-red-contrib-accesscontrol-nocontext)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Node-RED](https://nodered.org/) implementation of the [accesscontrol](https://www.npmjs.com/package/accesscontrol) nmp module, providing Role Based Access Control with the addition of Attributes (see this [NIST paper](https://csrc.nist.gov/publications/detail/journal-article/2010/adding-attributes-to-role-based-access-control)). 
Also supporting export/import to/from the [MongoDB node](https://flows.nodered.org/node/node-red-node-mongodb).
Unlike the other [accesscontrol](https://flows.nodered.org/node/node-red-contrib-accesscontrol) solution, context is not employed.


### Prerequisites

Node-RED installed. Tested on most versions starting from 2.0.5 up to 2.1.2.


### Installation
 
Install via Node-RED Manage Palette

```
node-red-contrib-accesscontrol
```

Install via npm

```shell
$ cd ~/.node-red
$ npm install node-red-contrib-accesscontrol
```

If necessary, restart Node-RED.


## How to use
10 nodes are provided:
- **AC init**: creates the AccessControl instance that contains all permissions (as no database is used).

- **AC export**: exports the AccessControl permissions as a string (JSON format). If specified, it can export with a identifier so it is possible to save the output directly into a MongoDB database, using the specific Node-RED node;

- **AC import**: imports the AccessControl permissions from a string (JSON format). As for the export node, an identifier can be specified to import from MongoDB and remove that field from the JSON;

- **grant**: enables to grant to a role a CRUD action (Create, Read, Update, Delete) over a resource;

- **extend**: a quick way of granting to a role the same permissions of another role, outlining a condition of inheritance towards this;

- **deny**: drops CRUD permissions previously set with grant, along with all optionally set attributes;

- **remove**: removes either specified role(s) or resource(s) from AccessControl;

- **permission**: checks if a specific permission (**without** attributes) is implemented or not. The result output can be either true or false based on this. If true, also the attributes that are linked to the operation are returned in a separate message field;

- **permissions**: checks if multiple permissions (**with** attributes) are implemented or not;

- **AC lock**: freezes the AccessControl instance. Attempts to modify it after calling this node will fail and will be reported.

Detailed information about each node can be read in the help tab of Node-RED.

Permission are defined by specification of 5 properties:
- role: the user or group of users receiving the authorization;
- resource: what the role can or cannot interact with;
- action: how the role can interact with the resource (CRUD actions);
- possession: specifies if the role can interact with the resource of 'any' other role or just with its 'own';
- attributes: optional values related to the resource, to provide a more accurate permission.


### Contribution

Feel free to add more options or whatever may be of use. If you find a bug, please report it on GitHub.
