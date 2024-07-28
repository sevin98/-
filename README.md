# A410 (포텐)

## 07.25 (유안)

    phaser+react 파일 첫번째로 커밋

### 완성된 내용

    - src/LoginForm 폴더에 로그인&게스트접속, 회원가입 페이지 생성 페이지 있음
    - 관련 스타일은 LoginForm.css 파일에 있음

### 이후 할 내용

    - Lobby폴더에 접속 후 이어지는 페이지 만들예정

## 07.25 (상우)

### UI 작업

    - 플레이어의 움직임에 영향을 받지 않는 UI 객체 완성
    - 이벤트를 통한 UI 동작
    - 해당 작업물은 lab branch의 fe/uitest0725에 압축파일로 존재합니다.

### 이후 할 내용

    - Phase별 동작에 맞도록 조건 작성

### 이후 할 내용

    - Lobby폴더에 접속 후 이어지는 페이지 만들예정

## 07.25 (수연)

    게임 대기 화면 구성 및 기능 구현 커밋
    npm run dev를 통해 실행 후 /login은 로그인 화면, /waitingRoom은 대기실 화면으로 이동된다
    현재 로그인 화면에 대기실 화면으로 바로 이동되는 버튼을 하나 넣어놓았음(추후 삭제 필요)

### 완성된 내용

    - src/WaitingRoom 폴더에 WaitingRoom 화면과 화면을 구성하는 각 하위 컴포넌트들,그리고 css 파일이 존재
    - 하위 컴포넌트 기능
      - BackToLobbyButton : /Lobby로 네비게이트하는 버튼
      - ShareRoomCodeButton : 해당 방에 지정된 코드를 클립보드에 복사하며, 복사했다는 메세지가 ChatBox에 뜬다
      - ReadyButton : 클릭시 준비 완료로 변하며, 취소할 수 없다
      - ChatBox : 디폴트 메세지는 '게임 준비 중', 서버로부터 게임 시작 신호를 수신받을 경우 '게임이 곧 시작됩니다'와 함께 5초(임시 지정) 카운트다운이 이루어지고 카운트다운이 끝나면 /GAME 으로 네비게이트 된다.
      - PlayerSlot : 전달받은 데이터를 기반으로 화면에 표시한다. 접속 플레이어 본인은 항상 첫번째 슬롯에 표기되며, 다른 이들의 준비 대기/준비 여부, 아이콘, 닉네임 등이 슬롯 하나에 들어있다. 슬롯은 총 8개 존재하며, 정보값이 없는 슬롯은 빈 슬롯으로 표시된다.
      - PlayerGrid : PlayerSlot을 포함하고 있는 전체적인 틀

### 이후 할 내용

    - 방 참여 불가 : 입장을 요청한 방에 8명의 플레이어가 접속해 있거나, 비밀 방의 비밀번호가 틀렸다면 입장이 거부되는 화면과 기능 구성
    - 각 프롬프트 연결 확인 후 정비

-----------------------

## 07.26 (유안)

### 완성된 내용

    ---
    naviate 활용시 주의
    **App.jsx에서 이하와 같이 특정 path를 설정한경우 **
    <Route path="/Lobby" element={<Lobby />} />
    **navigate의 인자로 path값 넣어줘야함**
    navigate("/Lobby");


    **.src/LoginForm**
    LoginForm 의 내부 로그인 동작 함수 추가 ex. onchange, [username,setusername]등
    - Login
      -  submit 누를 경우 onChange로 nickname, password 콘솔창에 뱉음
      -  LoginCheck = True 로 바뀌도록 구현 
      -  콘솔에 로그인체크 뜨게 만듦
    - Registration
      - submit 누를 경우 onChange로 registnickname, registpassword 콘솔창 뱉음
      - LoginCheck = True 로 바뀌도록 구현 

    **.src/Lobby**
    로그인 폼에서 게스트 접속 시 로비 페이지로 이동 

    lobby

    - Nickname(className임)
      - 닉네임 수정 일단 추가해놓음
    - navigateRoom(className임)
      - 방생성 버튼은 LobbyCreate
      - 방 참여 버튼은 LobbyJoin
      - 랜덤 매칭은 WaitingRoom 
        - **(이후 서버 연결 받아 특정 방으로 가도록 수정해야함)**


### 이후 할 내용
  - lobbyCreate: 방생성 페이지 이후 완성
  - lobbyJoin: 방참여 페이지 이후 완성


  ## 07/26 (수연)
  ### 완성된 내용
    - Stomp를 StompClient, StompContext.jsx로 network폴더 안으로 분리했다. App에서 라우터들을 StompProvider로 감싸 적용하고, 기존의 WaitingRoom을 대폭 수정함.
    - WaitingRoom과 유안이가 올린 Looby를 연결시키고 커밋
  ### 앞으로 할 일
    - 서버(백엔드)와 연결되면 API 명세서 참고해 서버에서 정보 통신하는 부분 수정, 입장 요청-거부 및 방 제거 부분 만들기


## 07.28 (유안)
  ### 완성된 내용
  1. router 폴더 생성
   - router.jsx에 주소명 생성 및 페이지 할당
  2. components 폴더 생성
   - 앞으로 자주 쓸 버튼등 컴포넌트에 넣어두기 
  3. pages 폴더 생성
   - 페이지 따로 넣어두기 