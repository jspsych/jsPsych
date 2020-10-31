# Collecting Data from Online Participants

## Hosting the Experiment and Saving the Data

jsPsych is a front-end JavaScript library that runs entirely on the participant's computer. To run a jsPsych experiment over the internet, the files need to be hosted on a public web server so that participants can access the experiment using a web link. Also, all of the data that jsPsych collects is stored on the participant's computer, in the browser's memory. This means that the data needs to be sent from the participant's browser back to the web server and stored in a database. 

To be maximally flexible, jsPsych doesn't handle the web server component. This makes jsPsych compatible with a wide range of hosting services and tools, allowing researchers to choose the web server option that best suit their needs. Some options for hosting jsPsych experiments include:

* [Cognition.run](https://www.cognition.run/) - A new free service designed specifically for hosting jsPsych experiments, with an easy-to-use interface. Great if you're just starting off!
* [JATOS](https://www.jatos.org/Whats-JATOS.html) - A free program that runs on your own server and provides a GUI for setting up experiments and accessing the data. Offers lots of features for creating more complex experiments and managing multiple researchers.
* [Pavlovia](https://pavlovia.org/) - A paid hosting service for web-based experiments, run by the PsychoPy team. Experiment files are managed on a GitLab repository, where they can then be launched on the Pavlovia server.
* [PsiTurk](https://psiturk.org/) - Python-based program to help you host your experiment on your own computer and collect data from MTurk (see Recruiting Participants below). Relatively easy for a DIY option.
* [Pushkin](https://languagelearninglab.gitbook.io/pushkin/) - A set of tools to help you set up your own virtual laboratory for massive online experiments. This option differs from the others in that it helps you set up a more standard website with a home page with different experiments, as well as other pages for information about your lab and research findings.
* Full DIY - You can setup your own web server and database and handle the communication yourself. Traditional web server 'stacks' include [LAMP](https://www.digitalocean.com/community/tutorial_collections/how-to-install-lamp)/[LEMP](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-20-04) (Linux operating system, Apache or Nginx server application, MySQL database, and PHP programming language). Other common web server frameworks include [Flask](https://flask.palletsprojects.com/) (Python) and [Node.js](https://nodejs.org/) (JavaScript).

## Recruiting Participants

Once your experiment is hosted on a web server, you could recruit participants in the same way that you would for lab-based studies. For instance, if your institution uses SONA, you can advertise your web-based study link on SONA. SONA allows you to automactically embed a unique ID in online study URLs, which you can then save in your data using [jsPsych's URL query parameters function](core_library/jspsych-data/#jspsychdatageturlvariable). SONA will also generate a completion URL that you can redirect participants to at the end of the study, and this will mark them as having completed the study in SONA.

To take full advanage of hosting an experiment online, many researchers advertise their experiments more widely. Social media and other media outlets provide one option for reaching a large number of potential participants. There are also some commercial platforms that you can use to advertise your study and pay anonymous online participants. These recruitment platforms charge a fee for use. The advantages of these platforms are that they handle the participant payments and allow you to specify pre-screening criteria. The most commonly used recruitment platforms in online behavioral research are:

* [Prolific](https://www.prolific.co/): An online labor market designed specifically for web-based research. 
* [Amazon Mechanical Turk (MTurk)](https://www.mturk.com/): An online labor market designed for advertising paid 'human intelligence tasks'. This service was designed for use by commercial businesses but has been used by behavioral researchers for many years.

Like SONA, Prolific and MTurk use URL query parameters to get participant information, and redirection to specific URLs to mark participants as having finished the study. jsPsych includes [convenience functions for interacting with MTurk participants](core_library/jspsych-turk/). Information about integrating with Prolific can be found in the researcher support section of their website.