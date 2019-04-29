

var wordsApp = new Vue({
    el: '#wordsApp',
    data: {
      items : [
        {id:0, filename: '', wordsUniqueCount: 0,criscross: 0,criscrossing: '',file:null,content:null,preview :'', keywords:[]},
        {id:1, filename: '',  wordsUniqueCount: 0,criscross: 0,criscrossing: '',file:null,content:null,preview :'' , keywords:[]}
      ],
      welcome:'Welcome on Words Criscrossing app  :-)',
      message: 'Please choose two text files to compare ...',
      minWordLength : 3,
      defaultFile : 'Select a file',
      results:'Ready to check your files !',
      matches:0,
      result:'',
      state:'non-selected',
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
                    that.items[id].keywords = index(that.items[id].content,that.minWordLength);
                    that.items[id].wordsUniqueCount = that.items[id].keywords.length;
                    that.items[id].criscross = 0;
                    that.items[id].criscrossing = '';
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
                this.items[0].keywords.forEach(function(keyword){
                    if(that.items[1].keywords.indexOf(keyword)!=-1){
                        matches ++;
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

function index (text,minLength){
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
			if(word.length >= minLength){
				if(!indexes[word]){
					indexes[word] = true;
					output.push(word);
				}
			}
		}
	});
	for(let i = output.length -1 ; i >=0;i--){
		let doDelete = false;
		if(output[i].indexOf("_") > -1){
			doDelete = true;
		}
		let test = parseInt(output[i]);
		if(!isNaN(test)){
			doDelete = true;
		}
		if(doDelete){
			output.splice(i,1);
		}
	}
	return output;
}
