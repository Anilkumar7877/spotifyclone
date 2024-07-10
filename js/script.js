console.log("lets write some javascript");

let currentsong=new Audio();
let currentfolder;

function convertSecondsToMinutes(seconds) {
    if(isNaN(seconds)||seconds<0){
        return "00:00"
    }

    seconds=seconds.toFixed(0 )
    // Calculate the minutes by dividing by 60 and rounding down
    const minutes = Math.floor(seconds / 60);
    // Calculate the remaining seconds using the modulus operator
    const remainingSeconds = seconds % 60;
    // Format minutes and seconds to be two digits each
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    // Return the formatted string
    return `${formattedMinutes}:${formattedSeconds}`;
  }

async function getsongs(folder){
    //we are fetching the songs from the songs folder html page
    let a = await fetch(`http://192.168.224.55:5501/spotify/${folder}/`)
    currentfolder=folder
    let response = await a.text();
    // console.log(response)
    let div=document.createElement("div");
    div.innerHTML=response; 
    let as=div.getElementsByTagName("a");
    
    // console.log(as)
    let songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.title.endsWith(".mp3")){
            songs.push(element.title.split(".mp3")[0]);
        }
    }

    //this makes the list of the songs 
    let songUL=document.getElementsByClassName("songlist")[0]
    songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML=songUL.innerHTML+ `<li>${song}</li>` ;
    }


    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            // console.log("song is : " + e.innerHTML);
            document.querySelector(".playbtn").src="img/playmusic.svg"
            playmusic(e.innerHTML.trim())
            // e.style.backgroundColor="#1ba50b";
            // var audio1 = new Audio("\songs\\"+e.innerHTML.trim()+ ".mp3")
            // audio1.play();
        })
    });

    return songs
    
}

const playmusic=(track,pause=false)=>{
    // console.log(`playing : ${currentfolder}/`+track+ ".mp3");
    
    if(!pause){
        currentsong.play();
        currentsong.src="img/playmusic.svg"
    }

    currentsong.src=`${currentfolder}/`+track+ ".mp3"
    document.querySelector(".playbtn").src="img/pause.svg"
    // currentsong.play()

    document.querySelector(".song_info").innerHTML=track;
    document.querySelector(".playtime").innerHTML="00:00/00:00";

    // var audio1 = new Audio("songs/"+track+ ".mp3")
    // audio1.play()

}

async function displayAlbums(){
    let playlists=document.querySelector(".playlists")
    // console.log(playlists);
    
    let a = await fetch("http://192.168.224.55:5501/spotify/songs/")
    // currentfolder=folder
    let response = await a.text();
    let div=document.createElement("div");
    div.innerHTML=response; 
    // console.log(div);

    let anchors=div.getElementsByTagName("a");
    // console.log(anchors);
        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        // console.log(e);
        if(e.href.includes("spotify/songs/")){
            let folder = e.href.split("/").slice(-1)[0]
            let a = await fetch(`http://192.168.224.55:5501/spotify/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            playlists.innerHTML=playlists.innerHTML+`<div data-folder="${folder}" class="play1">
            <div class="thumbnail1">
                <img src="songs/${folder}/cover.jpg" alt="" class="playlist_cover">
            </div>
            <div class="playdetails">
                <div class="playname">${response.title}</div>
                <div class="playmore">${response.description}</div>
            </div>
        </div>`
            console.log(playlists);
            
        }
    }
    
    Array.from(document.getElementsByClassName("play1")).forEach(e=>{
        e.addEventListener("click",async item=>{
            console.log(item.currentTarget);
            // console.log("hello");
            songs=await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
            
        })
    })
    
}

async function main(){ 
    let songs=await getsongs("songs/cs")
    // console.log(songs);
    
    playmusic(songs[1],true);

    //displaying the music albums
    displayAlbums()

    // spotify\songs\011 AANE_SE_USKE_AAYI_BAHAR - Copy.mp3
    var audio = new Audio(`${currentfolder}`+songs[4] + ".mp3");
    // audio.play();
    
    audio.addEventListener("loadeddata", () => {
        //duration of the song
        let duration = audio.duration;
        // console.log(duration)
    });

    // //this makes the list of the songs 
    // let songUL=document.getElementsByClassName("songlist")[0]
    // songUL.innerHTML=""
    // for (const song of songs) {
    //     songUL.innerHTML=songUL.innerHTML+ `<li>${song}</li>` ;
    // }


    // Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    //     e.addEventListener("click",element=>{
    //         // console.log("song is : " + e.innerHTML);
    //         document.querySelector(".playbtn").src="img/playmusic.svg"
    //         playmusic(e.innerHTML.trim())
    //         // e.style.backgroundColor="#1ba50b";
    //         // var audio1 = new Audio("\songs\\"+e.innerHTML.trim()+ ".mp3")
    //         // audio1.play();
    //     })
    // });

    //to make the song play and pause
    document.querySelector(".playbtn").addEventListener("click",()=>{
        if (currentsong.paused){
            currentsong.play()
            document.querySelector(".playbtn").src="img/pause.svg"
        }else{
            currentsong.pause()
            document.querySelector(".playbtn").src="img/playmusic.svg"
        }
    })
    currentsong.addEventListener("timeupdate",()=>{
        // console.log(currentsong.currentTime,currentsong.duration)
        document.querySelector(".playtime").innerHTML=`${convertSecondsToMinutes(currentsong.currentTime)} / ${convertSecondsToMinutes(currentsong.duration)}`
        document.querySelector(".seekcircle").style.left=((currentsong.currentTime)/(currentsong.duration))*100+"%"
    })


    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent=((e.offsetX/e.target.getBoundingClientRect().width)*100)
        document.querySelector(".seekcircle").style.left=percent+"%";
        currentsong.currentTime=(percent*(currentsong.duration)/100)
    })

    document.querySelector(".nextbtn").addEventListener("click",()=>{
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0].split(".")[0].replaceAll("%20"," "))
        // console.log(currentsong.src.split("/").slice(-1)[0].split(".")[0].replaceAll("%20"," ").trim());
        if((index+1)<songs.length){
            // console.log(songs[index+1])
            playmusic(songs[index+1])
        }
    })
    document.querySelector(".previousbtn").addEventListener("click",()=>{
        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0].split(".")[0].replaceAll("%20"," "))
        // console.log(currentsong.src.split("/").slice(-1)[0].split(".")[0].replaceAll("%20"," ").trim());
        if((index-1)>=0){
            // console.log(songs[index-1])
            playmusic(songs[index-1])
        }
    })

    document.querySelector(".volumerange").addEventListener("change",(e)=>{
        // console.log((e.target.value)+"/100");
        currentsong.volume=parseInt(e.target.value)/100;
    })

    // Array.from(document.getElementsByClassName("play1")).forEach(e=>{
    //     e.addEventListener("click",async item=>{
    //         console.log(item.currentTarget);
    //         // console.log("hello");
            
    //         songs=await getsongs(`songs/${item.currentTarget.dataset.folder}`)
    //         playmusic(songs[0])
    //     })
    // })

    document.querySelector(".volbtn").addEventListener("click",e=>{
        console.log(e.target.src);
        if(e.target.src.includes("img/volume.svg")){
            e.target.src=e.target.src.replaceAll("img/volume.svg","img/mute.svg")
            currentsong.volume=0
            document.querySelector("#rangee").value=0
        }else{
            e.target.src=e.target.src.replaceAll("img/mute.svg","img/volume.svg")
            currentsong.volume=0.5
            document.querySelector("#rangee").value=50
        }
        
    })

    document.querySelector(".slider_responsive").addEventListener("click",e=>{
        console.log("hello")
        document.querySelector(".big1").style.left="-6%"
    })
    document.querySelector(".close").addEventListener("click",e=>{
        console.log("hello")
        document.querySelector(".big1").style.left="-100%"
    })
}

main()
