# Data Storage

There are two very different kinds of data storage: data stored in **memory** and data stored **permanently**. Data stored permanently exists even after the browser running jsPsych closes, typically in a database or in a file on a web server. Data stored in memory exists only as long the browser window running jsPsych is open.

jsPsych has many features for interacting with data stored in memory, but relatively few for permanent data storage. This is a deliberate choice, mainly because there are dozens of ways that data could be stored permanently and this strategy avoids locking in one particular solution. However, saving data permanently is obviously a crucial component of any experiment, and the second half of this page contains a few suggestions on how to accomplish permanent data storage.

## Storing data in jsPsych's data structure

jsPsych has a centralized array of data that is filled in as the experiment runs. Each trial adds an entry to this array, and you can access the content of the array with various functions, including `jsPsych.data.getData()`, which returns the entire contents of jsPsych's data array.

In many cases, data collection will be automatic and hidden. Plugins save data on their own, so it is not uncommon to have the only interaction with the data be at the end of the experiment when it is time to save it in a more permanent manner (see sections below about how to do this). However, there are some situations in which you may want to interact with the data; in particular, you may want to store additional data that the plugins are not recording, like a subject identifier or condition assignment. You may also want to add data on a trial by trial basis. For example, in a Stroop paradigm you would want to label which trials are congruent and which are incongruent. These scenarios are explored below.

### Adding data to all trials

Often it is useful to add a piece of data to *all* of the trials in the experiment. For example, appending the subject ID to each trial. This can be done easily with the `jsPsych.data.addProperties` function. Here is an example:

```
// generate a random subject ID
var subject_id = Math.floor(Math.random()*100000);

// pick a random condition for the subject at the start of the experiment
var condition_assignment = jsPsych.randomization.sample(['conditionA', 'conditionB', 'conditionC'],1)[0];

// record the condition assignment in the jsPsych data
// this adds a property called 'subject' and a property called 'condition' to every trial
jsPsych.data.addProperties({
  subject: subject_id,
  condition: condition_assignment
});
```

### Adding data to a particular trial or set of trials

Data can be added to a particular trial by setting the `data` parameter for the trial. The `data` parameter is an object of key-value pairs, and each pair is added to the data for that trial.

```
var trial = {
  type: 'single-stim',
  stimulus: 'imgA.jpg',
  data: { image_type: 'A' }
}
```

Data declared in this way is also saved in the trials on any nested timelines:

```
var block = {
  type: 'single-stim',
  data: { image_type: 'A' },
  timeline: [
    {stimulus: 'imgA1.jpg'},
    {stimulus: 'imgA2.jpg'}
  ]
}
```

## Storing data permanently as a file

This is one of the simplest methods for saving jsPsych data on the server that is running the experiment. It involves a short PHP script and a few lines of JavaScript code. This method will save each participant's data as a CSV file on the server. **This method will only work if you are running on a web server with PHP installed, or a local server with PHP (e.g., [XAMPP](https://www.apachefriends.org/index.html)).**

This method uses a simple PHP script to write files to the server:

```php
<?php
// the $_POST[] array will contain the passed in filename and data
// the directory "data" is writable by the server (chmod 777)
$filename = "data/".$_POST['filename'];
$data = $_POST['filedata'];
// write the file to disk
file_put_contents($filename, $data);
?>
```

The `file_put_contents($filename, $data)` method requires permission to write new files. An easy way to solve this is to create a directory on the server that will store the data and use the chmod command to give all users write permission (chmod 777) to that directory. In the above example, I append the directory `data/` to the filename, and that directory is writable.

To use the PHP script, the JavaScript that runs jsPsych needs to send the filename and filedata information. jQuery has an easy to use method that enables JavaScript<->PHP communication. Here's an example:

```javascript
function saveData(filename, filedata){
   $.ajax({
      type:'post',
      cache: false,
      url: 'save_data.php', // this is the path to the above PHP script
      data: {filename: filename, filedata: filedata}
   });
}

// call the saveData function after the experiment is over
jsPsych.init({

   // code to define the experiment structure would go here...

   on_finish: function(data){ saveData("filename.csv", jsPsych.data.dataAsCSV()) }
});
```

To use this in an actual experiment, it would be important to tie the filename to some unique identifier like a subject number.

## Storing data permanently in a MySQL database

The ideal solution for storing data generated by jsPsych is to write it to a database.

There are dozens of database options. MySQL is one of the most popular [relational databases](http://en.wikipedia.org/wiki/Relational_database), is free to use, and relatively easy [to install](https://www.google.com/search?q=how+to+install+mysql). This page will assume that you have a MySQL database installed on your server that is hosting the jsPsych experiment, and that your server is able to execute PHP code. If you are trying to run on a local machine, you'll need to install a local server environment like [XAMPP](https://www.apachefriends.org/index.html).

### Step 1

To communicate with a MySQL database, you will need a server-side script, such as a PHP script. The following script should work for all jsPsych data. Copy the code below into a PHP file and give it an appropriate name (e.g. savedata.php). Put the PHP file on your server in a convenient location. **This script will only work with jsPsych version 4.0 and later.**

```php
<?php

// Submit Data to mySQL database
// Josh de Leeuw

// Edit this line to include your database connection script
//
//  The script you link should contain the following two lines:
//
//  $dbc = mysql_connect('localhost', 'username', 'password');
//  mysql_select_db('databasename', $dbc);
//
include('database_connect.php');

// You should not need to edit below this line

function mysql_insert($table, $inserts) {
    $values = array_map('mysql_real_escape_string', array_values($inserts));
    $keys = array_keys($inserts);

    return mysql_query('INSERT INTO `'.$table.'` (`'.implode('`,`', $keys).'`) VALUES (\''.implode('\',\'', $values).'\')');
}

// get the table name
$tab = $_POST['table'];

// decode the data object from json
$trials = json_decode($_POST['json']);

// get the optional data (decode as array)
$opt_data = json_decode($_POST['opt_data'], true);
$opt_data_names = array_keys($opt_data);

var_dump($trials);

// for each element in the trials array, insert the row into the mysql table
for($i=0;$i<count($trials);$i++)
{
	$to_insert = (array)($trials[$i]);
	// add any optional, static parameters that got passed in (like subject id or condition)
	for($j=0;$j<count($opt_data_names);$j++){
		$to_insert[$opt_data_names[$j]] = $opt_data[$opt_data_names[$j]];
	}
	$result = mysql_insert($tab, $to_insert);
}

// confirm the results
if (!$result) {
	die('Invalid query: ' . mysql_error());
} else {
	print "successful insert!";
}

?>
```

### Step 2

To use the above PHP script, you'll need to provide the credentials for your MySQL database. The PHP script is expecting the credentials to be stored in a separate PHP file called 'database_connect.php', located in the same directory as the PHP script. This file should look like:

```php
<?php

$dbc = mysql_connect('localhost', 'username', 'password');
mysql_select_db('databasename', $dbc);

?>
```

Replace the username and password strings with your database credentials, and replace the databasename string with the name of the database you are connecting to. For example, if my username is 'josh', my password is 'abc123', and the database is 'myresearch' then the file should look like:

```php
<?php

$dbc = mysql_connect('localhost', 'josh', 'abc123');
mysql_select_db('myresearch', $dbc);

?>
```

### Step 3


To use this PHP script, you need to invoke it from JavaScript code within your experiment page. Here's an example of how to do that.

```javascript
// data parameter should be either the value of jsPsych.data()
// or the parameter that is passed to the on_data_update callback function for the core library
// jsPsych.data() contains ALL data
// the callback function will contain only the most recently written data.
function save_data(data){
   var data_table = "my_experiment_table"; // change this for different experiments
   $.ajax({
      type:'post',
      cache: false,
      url: 'path/to_php/file.php', // change this to point to your php file.
      // opt_data is to add additional values to every row, like a subject ID
      // replace 'key' with the column name, and 'value' with the value.
      data: {
          table: data_table,
          json: JSON.stringify(data),
          opt_data: {key: value}
      },
      success: function(output) { console.log(output); } // write the result to javascript console
   });
}
```

Note that you'll need to change the script above to reference the table in your mysql database that will store the data, the path to the PHP file created in step 1, and change the opt_data line to include any data you want to append to the table, such as a subject ID (or remove this line entirely if you have no additional data).
