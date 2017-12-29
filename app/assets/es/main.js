'use strict';
'use strict';

// import { Person, Student } from './models';
import { GridOverlayElement } from './grid';
import { AJAX } from './utilities';

class App {
  constructor () {
    console.log('Constructor of the class');

    document.registerElement('grid-overlay', GridOverlayElement);

    this._gridOverlayElement = document.createElement('grid-overlay');
    document.body.appendChild(this._gridOverlayElement);
    this.resizeWindow();

    window.addEventListener('resize', () => this.resizeWindow());

    this.menuBtn = document.querySelector('#dropdown');
    this.menuBtn.addEventListener('click', this.openNav);

    this.closeBtn = document.querySelector('#close');
    this.closeBtn.addEventListener('click', this.closeNav);

    this.nestedList = document.querySelector('#first');
    this.nestedList.addEventListener('click', this.toggleList);

    this.logoutBtn = document.querySelector('#logoutBtn');
    this.logoutBtn.addEventListener('click', this.signOut);

    this.login = document.querySelector('#login');
    this.register = document.querySelector('#register');

    let latestSnap;

    if (document.querySelector('.login') !== null) {
      this.loginBtn = document.querySelector('#loginBtn');
      this.loginBtn.addEventListener('click', this.loginUserbyEmail);      
    }

    if (document.querySelector('.register') !== null) {
      this.registerBtn = document.querySelector('#registerBtn');
      this.registerBtn.addEventListener('click', this.signUp);

      

    }

    this.favorites = document.querySelector('#favorites');
    this.onLogin = document.querySelector('#loginRegister');

    if (window.location.href === 'http://localhost:8080/index.html') {
      this.projectContainer = document.querySelector('.projectContainer');
    }

    if (document.querySelector('.detailContainer') !== null) {
      this.projectDetailContainer = document.querySelector('.projectDetailContainer');
      this.submitComment = document.querySelector('.submitComment');
    }
   
  }

  resizeWindow () {
    this._gridOverlayElement.updateRendering(window.innerWidth, Math.max(
      window.innerHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight
    ), 24);
  }

  init () {
    console.log('Initialization of the class App');
    this.checkUser();
    this.animateProjects().init();
    if (document.querySelector('.projectDetailContainer') != null) {
      this.hitCounter();
    }
    if (document.querySelector('.index') != null) {
      this.loadProjectData();
    }
    if (document.querySelector('.detail') != null) {
      this.loadProjectDetails();
    }
    if (document.querySelector('.blog') !== null) {
      this.loadBlogData();
    }

    if (document.querySelector('.article') !== null) {
      this.loadBlogDetail();
    }


    
  }

  openNav () {
    document.getElementById('sidenav').style.width = '250px';
  }

  closeNav () {
    document.getElementById('sidenav').style.width = '0px';
  }

  toggleList () {
    document.querySelector('#opleidingen').classList.toggle('show');
  }

  checkUser () {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.favorites.style.display = 'block';
        this.logoutBtn.style.display = 'block';
        this.register.style.display = 'none';
        this.login.style.display = 'none';

      } else {
        this.favorites.style.display = 'none';
        this.logoutBtn.style.display = 'none';
      }
    });
  }

  signUp () {
    const email = document.querySelector('.email').value;
    const password = document.querySelector('.password').value;
    const repeat = document.querySelector('.repeat').value;
    if (email.length < 4) {
      document.querySelector('.registerError').style.display = 'block';
      return;
    }
    if (password.length < 4) {
      document.querySelector('.passwordError').style.display = 'block';
      return;
    }
    if (repeat !== password) {
      document.querySelector('.registerError').style.display = 'block';
      return
    }

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(error => {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/weak-password') {
        document.querySelector('.passwordError').style.display = 'block';
      } else {
        document.querySelector('.registerError').style.display = 'block';
      }
      console.log(error);
    });
  }

  loginUserbyEmail () {
    let errorMessage = document.querySelector('#errormessage');
    let email = document.querySelector('#emailInput').value;
    let password = document.querySelector('#passwordInput').value;
    console.log('test');
    if (email !== '' && password !== '') {
      firebase.auth().signInWithEmailAndPassword(email, password).then((user) =>{
        location.href='index.html';
      }).catch(error => {
        console.log(error.message);
        document.querySelector('.displayError').style.display = 'block';
      });
    }
    //location.href='index.html';
  }

  hitCounter () {
    const projectId = this.getParameterByName('id');
    const viewRef = firebase.database().ref('projects/' + projectId + '/views');
    viewRef.transaction((currentViews) => {
      return currentViews + 1;
    });
  }

  signOut () {
    firebase.auth().signOut().then((data) => {
      location.href='index.html'
    });
  }

  animateProjects () {
    let elems;
    let windowheight;

    const init = function () {
      elems = document.getElementsByClassName('hidden');
      windowheight = window.innerHeight;
      _addEventHandlers();
    };
    const _addEventHandlers = function () {
      window.addEventListener('scroll', _checkPosition);
      window.addEventListener('resize', init);
    };
    const _checkPosition = function () {
      for (let i = 0; i < elems.length; i++) {
        let posFromTop = elems[i].getBoundingClientRect().top;
        if (posFromTop - windowheight <= 0) {
          elems[i].className = elems[i].className.replace('hidden', 'projectTemplate');
        }
      }
    };
    return {
      init: init
    };
  }

  getParameterByName (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  

  loadProjectData () {
    let dbRef = firebase.database().ref().child('projects');
    let projectTemplate = AJAX.loadTextByPromise('../templates/projects.hbs').then((data) => {
      let compiledProjectTemplate = Handlebars.compile(data);
      dbRef.on('value', (snap) => {
        let data = snap.val();
        let ourGeneratedHTML = compiledProjectTemplate(data);
        document.querySelector('.projectContainer').innerHTML = ourGeneratedHTML;
      })
    });
  }  
  loadProjectDetails () {
    let dbRef = firebase.database().ref();
    const projectId = this.getParameterByName('id');
    let projectDetailTemplate = AJAX.loadTextByPromise('../templates/project_detail.hbs').then((data) => {
      const compiledProjectDetailTemplate = Handlebars.compile(data);
      dbRef.on('value', (snap) => {
        let data = snap.val().projects[projectId];
        let generatedHTML = compiledProjectDetailTemplate(data);
        document.querySelector('.projectDetailContainer').innerHTML = generatedHTML;
      });
    });
  }

  loadBlogData () {
    let blogRef = firebase.database().ref('blog/posts');
    let blogTemplate = AJAX.loadTextByPromise('../templates/blog_template.hbs').then((data) => {
      let compiledBlogTemplate = Handlebars.compile(data);
      blogRef.on('value', (snap) => {
        let data = snap.val();
        let generatedHTML = compiledBlogTemplate(data);
        document.querySelector('.blogContainer').innerHTML = generatedHTML;
      });
    });
  }

  loadBlogDetail () {
    let blogRef = firebase.database().ref('blog');
    const blogId = this.getParameterByName('id');
    let blogDetailTemplate = AJAX.loadTextByPromise('../templates/blog_detail.hbs').then((data) => {
      const compiledBlogDetailTemplate = Handlebars.compile(data);
      blogRef.on('value', (snap) => {
        let data = snap.val().posts[blogId];
        console.log(data)
        let generatedHTML = compiledBlogDetailTemplate(data);
        document.querySelector('.blogDetail').innerHTML = generatedHTML;
      });
    });
  }

  timeStamp = () => {
    let options = {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute:'2-digit'
    };
    let now = new Date().toLocaleString('en-US', options);
    return now;
  };

  postComment () {
    const projectId = this.getParameterByName('id');
    let nameVal = document.querySelector("#commentName").value;
    let commentVal = document.querySelector("#commentContext").value;
    const commentRef = firebase.database().ref('projects/' + projectId + '/comments');
    const commentCount = firebase.database().ref('projects/' + projectId + '/commentCount');

    if (nameVal && commentVal) {
      commentRef.push({
        name: nameVal,
        comment: commentVal,
        time: this.timeStamp()
      });

      commentCount.transaction((currentCount) => {
        return currentCount + 1;
      });
    }
  }


};

window.addEventListener('load', (ev) => {
  window.app = new App();
  window.app.init();
});
