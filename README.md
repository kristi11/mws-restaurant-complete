# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 3

This project is forked from Udacity's original stage 1 **Restaurant Reviews** project. It's been updated to be fully responsive and mobile ready. This project uses a service worker to implement progressive web app functionality like "installing" the website on your phone and accessing it offline.

Further improvements have been made to get it ready for stage 3 including adding a form for posting reviews, posting the reviews to indexedDb in case theres's no internet connection and adding them into the server when connection is established and also adding an option to add/remove a restaurant as a favorite. Further performance improvements have been made to achieve performance requirements for stage 3.

After installing and lifting the server provided by Udacity https://github.com/udacity/mws-restaurant-stage-3 follow the steps below.

If you prefer to not install the server on your own you can use the one included on this project.To do that in a terminal `cd` into `mws-restaurant-stage-3` and run `npm install` to install the node dependencies and then run `node server` to lift the server.When creating your own project include the `mws-restaurant-stage-3` folder in a separate folder from your code. That folder is there just to act as a real world server to give your a better understanding how you would work on a real world project. It should not be touched or changed. The only reason it is included within this project is that it is easier to install for whoever wants to download the server code along with this project and not seperately.Do not let it confuse you because it sure confused me.

Then,

In a terminal `cd` into `mws-restaurant-complete` and run `npm install` to install all the required dependencies for the first time. After that run `python3 -m http.server 8000` to start the local server.
This folder contains all the code that's being worked on.

Now go to http://localhost:8000 to see the project.

Happy coding :)

## Author
<a href="https://github.com/kristi11">Kristi Tanellari</a>