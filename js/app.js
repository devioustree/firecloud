require(['https://connect.soundcloud.com/sdk.js'],
    function() {
        initialiseSoundCloud();
        
        var btnSoundcloud = document.querySelector("#soundcloud-btn");
        btnSoundcloud.addEventListener('click', handleSoundcloudButtonClick);
        
        var trackList = document.querySelector('#track-list ul');
        
        var currentSound = undefined;
        
        function initialiseSoundCloud() {
            SC.initialize({
                client_id: '006a65d1b4ba71d8b6633d74b5a5cf9b',
                redirect_uri: 'http://192.168.0.128:8000/callback.html'
            });
        }
        
        function handleSoundcloudButtonClick() {
            SC.connect(function(){
                SC.get("/me/activities", function(response) {
                    var activities = response.collection;
                    activities.forEach(parseActivity);
                    
                    if (response.next_href) {
                        SC.get(response.next_href, function(response) {
                            var activities = response.collection;
                            activities.forEach(parseActivity);
                        });
                    }
                });
            });
        }
        
        function parseActivity(activity) {
            if (activity.type === 'track') {
                var track = activity.origin;
                var user = track.user;
                
                var trackURL = '/tracks/' + track.id;
                var li = document.createElement('li');
                
                var aside = document.createElement('aside');
                var coverImage = document.createElement('img');
                var title = document.createElement('p');
                var artist = document.createElement('p');
                
                aside.appendChild(coverImage);
                li.appendChild(aside);
                li.appendChild(title);
                li.appendChild(artist);
                
                coverImage.src = track.artwork_url;
                title.innerHTML = track.title;
                artist.innerHTML = user.username;
                
                li.addEventListener('click', trackClickListener(trackURL, track.waveform_url));
                trackList.appendChild(li);
            }
        }
        
        function trackClickListener(trackURL, waveformURL) {
            return function() {
                this.style.backgroundImage = 'url('+waveformURL+')';
                
                SC.stream(trackURL, function(sound){
                    if (currentSound !== undefined) {
                        currentSound.stop();
                    }
                    
                    currentSound = sound;
                    currentSound.play();
                });
            }
        }
    }
);