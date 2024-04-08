// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyClIkkIJGEg-ACcFwVlmMBCMVr0EyhhFjQ",
    authDomain: "sparta-89004.firebaseapp.com",
    projectId: "sparta-89004",
    storageBucket: "sparta-89004.appspot.com",
    messagingSenderId: "741591338323",
    appId: "1:741591338323:web:46afa818eaeda0193125a6",
    measurementId: "G-W8KQ6N58T5"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 엔터 키로 검색
$('#query').on('keypress', async function (e) {
    if (e.which === 13) {
        e.preventDefault();

        const queryText = $('#query').val().toLowerCase();
        const allDocs = await getDocs(collection(db, "meme"));

        $('#card').empty();

        allDocs.forEach((doc) => {
            const row = doc.data();
            if (row.title.toLowerCase().includes(queryText)) {
                displayResult(row);
            }
        });

        if ($('#card').children().length === 0) {
            alert("검색결과가 없습니다.");
        }
    }
});

// 버튼 클릭으로 검색
$("#search").click(async function () {
    const queryText = $('#query').val().toLowerCase();
    const allDocs = await getDocs(collection(db, "meme"));

    $('#card').empty();

    allDocs.forEach((doc) => {
        const row = doc.data();
        if (row.title.toLowerCase().includes(queryText)) {
            displayResult(row);
        }
    });

    if ($('#card').children().length === 0) {
        alert("검색결과가 없습니다.");
    }
})

// HTML 형태의 결과를 화면에 출력
function displayResult(row) {
    const { content, id, isImage, source, timestamp, title, year } = row;
    const temp_html = `
            <div class="col">
                <div class="card" data-id="${id}" style="height: 100%;">
                    <img src="${source}"
                        class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${content}</p>
                    </div>
                    <div class="card-footer" style="text-align: right";>
                        <small>${year}년도</small>
                    </div>
                </div>
            </div>`;
    $('#cards').append(temp_html);
}

// post용 modal 선언
const postModal = new bootstrap.Modal(document.getElementById('postmodal'));

// 유튜브 동영상 id만 추출하기
// https://www.youtube.com/watch?v=${id} 형식만 추출됨
// 글 등록할 때 유효한 동영상 주소인지 검사하면 좋을 듯합니다.
function getYouTubeVideoId(url) {
    const regex = /[?&]v=([^&#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// 텍스트 내에 존재하는 링크를 하이퍼링크로 변환
function convertLinks(text) {
    // URL 패턴 정규식
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // 링크를 하이퍼링크로 변환
    const convertedText = text.replace(urlPattern, function (url) {
        if (url.includes('">')) {
            // 이미 <a> 태그로 감싸진 URL인 경우 원본 URL 반환
            return url;
        } else {
            // <a> 태그로 감싸지 않은 URL인 경우 하이퍼링크로 변환
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        }
    });

    return convertedText;
}

// mediaContainer 안에 imageContainer를 붙이는 함수
// 무조건 성공시키는데 예외가 추가되면 실패 시 false 반환 기능 추가
function makeImageContainer(mediaContainer, row) {
    // 이미지 표시
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('modal-image-container');
    const image = document.createElement('img');
    image.src = row['source'];
    image.classList.add('img-fluid', 'modal-image');

    imageContainer.appendChild(image);
    mediaContainer.appendChild(imageContainer);

    return true;
}

// mediaContainer 안에 videoContainer를 붙이는 함수
// video id가 유효하지않으면 false 반환
function makeVideoContainer(mediaContainer, row) {
    // 유튜브 비디오 재생
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('modal-video-container');
    const videoId = getYouTubeVideoId(row['source']);
    if (videoId) // video id가 null로 반환 되었을 때 예외 처리
    {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1;`;
        iframe.classList.add('modal-video');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowFullscreen', 'false');

        videoContainer.appendChild(iframe);
        mediaContainer.appendChild(videoContainer);

        return true;
    }
    else {
        console.log("유효한 영상 주소가 아닙니다.");
        alert("유효한 영상 주소가 아닙니다.");

        return false;
    }
}

function openPostModal(row) {
    //console.log(row['id']);
    //console.log(row['isImage']);
    //console.log(row['source']);
    //console.log(row['title']);
    //console.log(row['year']);
    //console.log(row['content']);

    const mediaContainer = document.getElementById('mediaContainer');
    mediaContainer.innerHTML = '';

    let isShowModal = false;
    if (row['isImage']) {
        isShowModal = makeImageContainer(mediaContainer, row);
    }
    else {
        isShowModal = makeVideoContainer(mediaContainer, row);
    }

    if (isShowModal) {
        const memeTitle = document.getElementById('memeTitle');
        const memeDate = document.getElementById('memeDate');
        const memeDescription = document.getElementById('memeDescription');

        memeTitle.textContent = row['title'];
        memeDate.textContent = row['year']; //+ row['month']

        memeDescription.innerHTML = convertLinks(row['content']); // 하이퍼링크를 사용하는 경우 textContent 사용이 아닌 innerHTML 사용

        postModal.show();
    }
}

// postModal이 닫힐 때 기존 유튜브 영상 비우기
postModal._element.addEventListener('hidden.bs.modal', function () {
    const videoContainer = document.querySelector('.modal-video-container');
    if (videoContainer) {
        const iframe = videoContainer.querySelector('iframe');
        if (iframe) {
            const videoSrc = iframe.src;
            iframe.src = '';
            iframe.src = videoSrc;
        }
    }
});

// DB 자료 상 id를 기준으로 카드 생성
let docs = await getDocs(collection(db, "memes"));

// 문서를 배열로 저장
let sortedDocs = [];
docs.forEach((doc) => {
    sortedDocs.push(doc);
});

// id를 기준으로 내림차순으로 정렬
sortedDocs.sort((a, b) => b.data().timestamp - a.data().timestamp);

// 정렬된 문서를 이용하여 카드 생성
sortedDocs.forEach((doc) => {
    let row = doc.data();

    let cardId = row['id'];
    let sourceType = row['isImage'];
    let source = row['source'];
    let title = row['title'];
    let content = row['content'];
    let year = row['year'];
    let whenwrite = row['timestamp']

    let temp_html = `
                <div class="col">
                    <div class="card" data-id="${cardId}" data-is-image="${sourceType}" style="height: 100%;">
                        <img src="${source}"
                            class="card-img-top" alt="...">
                            <div class="card-body">
                            <h5 class="card-title">${title}</h5>
                            <p class="card-text">${content}</p>
                        </div>
                            <div class="card-footer" style="text-align: right";>
                            <small>${year}년도</small>
                        </div>
                        작성일자 식별용: ${whenwrite}
                    </div>
                </div>`;

    $('#cards').append(temp_html);

    const card = document.querySelector(`[data-id="${cardId}"]`);
    card.addEventListener('click', async function () {
        const clickedCardId = this.getAttribute('data-id');

        // 클릭된 카드의 id 값을 사용하여 모달 열기
        let clickedDoc = sortedDocs.find(doc => doc.id === clickedCardId);
        if (clickedDoc) {
            openPostModal(clickedDoc.data());
        }
    })
});

// 글쓰기 모달
let isImageTemp = true;

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

$('#video').hide();

$("#imgbtn").click(async function () {
    isImageTemp = true;
    $('#image').show();
    $('#video').hide();
    checkEmpty();
})

$("#vdobtn").click(async function () {
    isImageTemp = false;
    $('#image').hide();
    $('#video').show();
    checkEmpty();
})

// URL 유효성을 확인하는 함수
function isValidURL(url) {
    // URL 정규 표현식
    var pattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return pattern.test(url);
}

$("#writebtn").on("click", async function () {
    let id = guid();
    let isImage = isImageTemp;
    let source;
    if (isImage) {
        source = $('#image').val();
    } else {
        source = $('#video').val();
    }
    let title = $('#title').val();
    let year = $('#year').val();
    let content = $('#content').val();
    l// 입력된 값이 유효한 URL인지 확인
    if (isValidURL(source)) {
        // 유효한 URL인 경우 업로드
        let data = {
            'id': id,
            'isImage': isImage,
            'source': source,
            'title': title,
            'year': year,
            'content': content,
            'timestamp': new Date()
        };

        await setDoc(doc(db, "memes", String(id)), data);
        window.location.reload();

        alert('업로드 성공!');
    } else {
        // 유효하지 않은 URL인 경우 경고 표시
        alert('주소를 확인해 주세요.');
    }
})

// input 필드가 변경될 때마다 호출되는 함수
function checkEmpty() {
    // input 필드의 값을 가져옴
    let image = $('#image').val().trim();
    let video = $('#video').val().trim();
    let title = $('#title').val().trim();
    let year = document.getElementById('year').selectedIndex;
    let content = $('#content').val().trim();

    if (isImageTemp) {
        if (image !== '' && title !== '' && year !== 0 && content !== '') {
            document.getElementById('writebtn').disabled = false;
        } else {
            document.getElementById('writebtn').disabled = true;
        }
    } else {
        if (video !== '' && title !== '' && year !== 0 && content !== '') {
            document.getElementById('writebtn').disabled = false;
        } else {
            document.getElementById('writebtn').disabled = true;
        }
    }
}

// input 필드가 변경될 때마다 checkInput 함수 호출
document.getElementById('image').addEventListener('input', checkEmpty);
document.getElementById('video').addEventListener('input', checkEmpty);
document.getElementById('title').addEventListener('input', checkEmpty);
document.getElementById('year').addEventListener('change', checkEmpty);
document.getElementById('content').addEventListener('input', checkEmpty);

// select 요소에서 값이 변경될 때마다 호출되는 이벤트 리스너 추가
$("select.form-select").change(async function () {

    // 사용자가 선택한 옵션 값 가져오기
    const selectedValue = $(this).children("option:selected").val();

    // 모든 카드 없애기
    $(".col").remove();

    // 선택한 옵션 값에 따라 필터링하여 해당하는 카드만 표시
    if (selectedValue === "jjal") {
        // sourceType이 true인 카드만 표시
        sortedDocs.forEach((doc) => {
            let row = doc.data();
            if (row.isImage) {
                displayResult(row);
            }
        });

    } else if (selectedValue === "vdo") {
        // sourceType이 false인 카드만 표시
        // sourceType이 false인 카드만 생성
        sortedDocs.forEach((doc) => {
            let row = doc.data();
            if (!row.isImage) {
                displayResult(row);
            }
        });
    } else {
        // 전체 카드 표시
        sortedDocs.forEach((doc) => {
            let row = doc.data();
            displayResult(row);
        });
    }

    // 각 카드에 대해 클릭 이벤트 리스너 다시 등록
    $('.card').on('click', async function () {
        const clickedCardId = $(this).data('id');

        // 클릭된 카드의 id 값을 사용하여 모달 열기
        let clickedDoc = sortedDocs.find(doc => doc.id === clickedCardId);
        if (clickedDoc) {
            openPostModal(clickedDoc.data());
        }
    });
});