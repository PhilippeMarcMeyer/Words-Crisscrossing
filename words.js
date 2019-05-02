
var database;
var fireUser = null;
var refLatin = null;

var DefaultRules = {
 MinLength : 3,
 StopWords : [],
 substantives : [],
 subSelectors : []
}

var rules = DefaultRules;

var wordsApp = new Vue({
    el: '#wordsApp',
    data: {
      items : [
        {id:0, filename: '', wordsCount: 0, wordsUniqueCount: 0,criscross: 0,criscrossing: '',file:null,content:null,preview :'', keywords:[],entries:{}},
        {id:1, filename: '', wordsCount: 0,  wordsUniqueCount: 0,criscross: 0,criscrossing: '',file:null,content:null,preview :'' , keywords:[],entries:{}}
      ],
      welcome:'Welcome on Words Criscrossing app  :-)',
      message: 'Please choose two text files to compare ...',
      rules : rules,
      defaultFile : 'Select a file',
      results:'Ready to check your files !',
      matches:0,
      result:'',
      state:'non-selected',
	  rulesInfo : '',
	  criscrosslist : []
    },
    computed:{
        status :function(){
            return  {'non-selected':'Ready to check your files !','selected':'<- click to process results','processed':this.result};
        }
    },
    methods:{
        previewFiles:function(item,id,event){
            let files = event.target.files;
            if(files.length > 0){
               // let id = item.id;
                this.items[id].file = files[0];
                this.items[id].filename = files[0].name;
                let reader = new FileReader();
                let that=this;
                reader.onload = function(event) { 
                    that.items[id].content = reader.result;
                    that.items[id].preview = shortenSentence(that.items[id].content.trim().replace("\r\n"," ").replace("\n"," "),60,"...");
                    that.items[id].entries = index(that.items[id].content,that.rules);
					that.items[id].keywords = that.items[id].entries.map(function(x){
						return x[0];
					});
					
                    that.items[id].wordsUniqueCount = that.items[id].keywords.length;
					that.items[id].wordsCount = function(){
						let result = 0;
						that.items[id].entries.forEach(function(x){
							result += x[1];
						});
						return result;
					}();
                    that.items[id].criscross = 0;
                    that.items[id].criscrossing = '';
					that.criscrosslist = [];
                    that.setState();
                };
                reader.readAsText(item.file);
            }
        },
      setState : function(){
        let that = this;
        this.state = 'selected';
        this.items.forEach(function(item){
            if(item.wordsUniqueCount == 0){
                that.state = 'non-selected'
            }
        }) 
        if( this.state=='selected'){
            this.state = 'processed'
            this.items.forEach(function(item){
                if(item.criscross == 0){
                    that.state = 'selected'
                }
            }) 
        }
        if( this.state!='processed'){
            this.items.forEach(function(item){
                item.criscross = 0;
                item.criscrossing = '';
            })            
        }
        this.setResult();
      },
      setResult : function(){
        let that = this;
        this.results = this.status[this.state];
      },
      processFiles : function(){
        if(this.items[0].wordsUniqueCount * this.items[1].wordsUniqueCount != 0 ){
            let that = this;
            let matches = 0;
            if( this.state=='selected'){
				this.criscrosslist = [];
                this.items[0].entries.forEach(function(entrie){
					let keyword = entrie[0];
					let offset = that.items[1].keywords.indexOf(keyword);
                    if(offset!=-1){
                        matches ++;
						that.criscrosslist.push({
							word:keyword,
							nr1 : entrie[1],
							nr2 : that.items[1].entries[offset][1]
						});
                    }
                })
                this.matches = matches;
                this.items[0].criscross = (100 * matches / this.items[0].wordsUniqueCount);
                this.items[1].criscross = (100 * matches / this.items[1].wordsUniqueCount);
                this.items[0].criscrossing = this.items[0].criscross.toFixed(2)+" %";
                this.items[1].criscrossing = this.items[1].criscross.toFixed(2)+" %"; 
                let averageWordCount = (this.items[0].wordsUniqueCount + this.items[1].wordsUniqueCount)/2;              
                that.result = matches + " matches for an average criscross of " + (100 * (matches / averageWordCount)).toFixed(2) + ' %';
                this.setState();
				document.querySelector("#criscross-list-zone").classList.remove("hide");
            }
        }
    }
    }
});

  function shortenSentence(sentence, nrWantedChars, endString) {
    var output = "";
    var nrRealChars = sentence.length;
    var nrWantedWords = 0;
    var cumulatedLength = 0
    if (nrRealChars > nrWantedChars) {
        var words = sentence.split(" ");
        var nrWords = words.length;
        if (nrWords == 1) {
            output = words[0];
        } else {
            cumulatedLength = words[0].length;
            output = words[0];
            for (var i = 1; i < nrWords; i++) {
                cumulatedLength += words[i].length + 1
                if (cumulatedLength <= nrWantedChars) {
                    output += " " + words[i];
                }
            }
        }
        if (endString) output += endString;

    } else {
        output = sentence;
    }
    return output;
}

function index (text,rules){
	var indexes = {};
	var output = [];
	var start = -1;
	var end = -1;
	var textWithOutCode = text.replace(/[\W]+/g," ").toLowerCase();
	textWithOutCode = textWithOutCode.replace(/ {1,}/g," ");
	var words = textWithOutCode.split(" ");
	words.sort();
	var previous = null;
	words.forEach(function(word){
		if(word!=previous){
			previous = word;
			if(word.length >= rules.MinLength && rules.StopWords.indexOf(word)==-1){
				if(!indexes[word]){
					indexes[word] = 1;
					//output.push(word);
				}
			}
		}else{
			if(word.length >= rules.MinLength && rules.StopWords.indexOf(word)==-1){
				indexes[word]++;
			}
		}
	});
	return Object.entries(indexes);
}

  var config = {
    apiKey: "AIzaSyCdE3mJVWexNDOh83rNA5S29N2KK5gcy-c",
    authDomain: "first-firebase-project-5ada0.firebaseapp.com",
    databaseURL: "https://first-firebase-project-5ada0.firebaseio.com",
    projectId: "first-firebase-project-5ada0",
    storageBucket: "first-firebase-project-5ada0.appspot.com",
    messagingSenderId: "770548806963"
  };

   firebase.initializeApp(config);
     database = firebase.database();
   
	document.querySelector("#btnLogout").addEventListener("click", function(){
		var auth = firebase.auth();
		auth.signOut();
	});
	
	firebase.auth().onAuthStateChanged(function(user){
		var getData = true;
		if(user){
			fireUser = user;
			document.querySelectorAll(".whenOn").forEach(
				function(dom){
					dom.classList.remove("hide");
			});
			document.querySelectorAll(".whenOff").forEach(
				function(dom){
					dom.classList.add("hide");
			});
			if(user.displayName){
					document.querySelector("#userMessage").innerHTML = "You are logged as "+user.displayName+"&nbsp;&nbsp;&nbsp;";
			}else{
					document.querySelector("#userMessage").innerHTML = "You are logged as "+user.email+"&nbsp;&nbsp;&nbsp;";
			}
		}else{
			getData = false;
			fireUser = null;
			document.querySelectorAll(".whenOn").forEach(
				function(dom){
					dom.classList.add("hide");
			});
			document.querySelectorAll(".whenOff").forEach(
				function(dom){
					dom.classList.remove("hide");
			});

			document.querySelector("#userMessage").innerHTML = "";
			rules = DefaultRules;
			wordsApp.rulesInfo = '';
		}
		if(getData){
			refLatin = database.ref("Latin");
			refLatin.on('value',gotDataPost,errDataPost);
		}
	});
	
document.querySelector("#googleAuth").addEventListener("click", function () {
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('profile');
	provider.addScope('email');
	firebase.auth().signInWithPopup(provider).then(function(result) {
	 // This gives you a Google Access Token.
	 var token = result.credential.accessToken;
	 // The signed-in user info.
	 fireUser = result.user;

	});
});


function gotDataPost(data){
	var obj = data.val();
	if(obj){
			//console.log(obj);
		var entries = Object.entries(obj);
		
		//var key = entries[0][0];
		wordsApp.rules = entries[0][1];	
		if(!rules.substantives) rules.substantives = [];
		wordsApp.rulesInfo = 'Latin rules loaded : words minimum length is ' + wordsApp.rules.MinLength + ' and stop words list contains ' + wordsApp.rules.StopWords.length + ' entries';
	}
}

 function errDataPost(err){
	console.log("error in post !");
	console.log(err);
}

/*
function createLatin(){
	 var refLatin = database.ref("Latin");
	 var obj = {
		 MinLength : 2,
		 StopWords : stops,
		 substantives : [],
		 subSelectors : [{
			 name : "1st or 2nd declension",
			 ends : ["a","us","a1","us1","a2","us2"]
		 }]
	 }
	 refLatin.push(obj);
}
*/
