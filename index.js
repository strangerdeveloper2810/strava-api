// const clientId = '127128';
// const clientSecret = 'b6097f741c5e7156764b8350179145222fa1cfa4';
// const scope = 'read,activity:read_all';
// const redirectUri = 'https://test-strava.surge.sh';

// // Hàm để gửi yêu cầu lấy access token từ Strava
// function fetchAccessToken(code) {
//     const tokenUrl = 'https://www.strava.com/oauth/token';
//     const params = {
//         client_id: clientId,
//         client_secret: clientSecret,
//         code: code,
//         grant_type: 'authorization_code',
//         redirect_uri: redirectUri
//     };

//     // Gửi yêu cầu POST để lấy access token
//     return axios.post(tokenUrl, null, { params: params });
// }

// // Sự kiện khi người dùng nhấn vào nút "Đăng nhập Strava"
// document.getElementById('authorizeBtn').addEventListener('click', () => {
//     // Tạo URL authorize của Strava
//     const stravaAuthorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

//     // Redirect người dùng đến trang authorize của Strava
//     window.location.href = stravaAuthorizeUrl;
// });

// // Kiểm tra nếu có mã code trong URL (được trả về sau khi người dùng ủy quyền thành công)
// const urlParams = new URLSearchParams(window.location.search);
// const code = urlParams.get('code');
// if (code) {
//     // Gửi yêu cầu lấy access token từ Strava và xử lý kết quả
//     fetchAccessToken(code)
//         .then(response => {
//             // Lấy access token từ response
//             const accessToken = response.data.access_token;
//             console.log('Access Token:', accessToken);

//             // Lưu access token vào localStorage
//             localStorage.setItem('stravaAccessToken', accessToken);

//             // Hiển thị thông báo authorize thành công (ví dụ: dùng một div có id "statusMessage" để hiển thị)
//             document.getElementById('statusMessage').textContent = 'Authorize thành công!';
//             document.getElementById('statusMessage').style.display = 'block';

//             // Sau khi lấy được access token, bạn có thể thực hiện các thao tác khác như gọi API Strava để lấy thông tin người dùng, hoạt động, vv.
//         })
//         .catch(error => {
//             console.error('Error fetching access token:', error.response.data);
//             alert('Lỗi xảy ra khi lấy accessToken từ Strava.');
//         });
// }
// 597228875287-h6vn9sg7q7t4orl427ul7uaonamrjnpm.apps.googleusercontent.com

// index.js
const clientId = '127128';
const clientSecret = 'b6097f741c5e7156764b8350179145222fa1cfa4';
const scope = 'read,activity:read_all';
const redirectUri = 'https://strava-api-dun.vercel.app/';
const sheetDbUrl = 'https://sheetdb.io/api/v1/6q0812gcbeszf'

// Hàm để gửi yêu cầu lấy access token từ Strava
function fetchAccessToken(code) {
    const tokenUrl = 'https://www.strava.com/oauth/token';
    const params = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
    };

    // Gửi yêu cầu POST để lấy access token
    return axios.post(tokenUrl, null, { params: params });
}

// Sự kiện khi người dùng nhấn vào nút "Đăng nhập Strava"
document.getElementById('authorizeBtn').addEventListener('click', () => {
    // Tạo URL authorize của Strava
    const stravaAuthorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    // Redirect người dùng đến trang authorize của Strava
    window.location.href = stravaAuthorizeUrl;
});

// Kiểm tra nếu có mã code trong URL (được trả về sau khi người dùng ủy quyền thành công)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    // Gửi yêu cầu lấy access token từ Strava và xử lý kết quả
    fetchAccessToken(code)
        .then(response => {
            // Lấy các giá trị cần lưu từ response
            const accessToken = response.data.access_token;
            const athleteId = response.data.athlete.id;

            // Lưu access token và thông tin người dùng vào localStorage hoặc state của ứng dụng
            localStorage.setItem('stravaAccessToken', accessToken);
            localStorage.setItem('athleteId', athleteId);

            // Hiển thị thông báo authorize thành công
            const statusMessage = document.createElement('div');
            statusMessage.id = 'statusMessage';
            statusMessage.textContent = 'Authorize thành công!';
            statusMessage.style.display = 'block';
            document.body.appendChild(statusMessage);
        })
        .catch(error => {
            console.error('Error fetching access token:', error.response.data);
            alert('Lỗi xảy ra khi lấy accessToken từ Strava.');
        });
}

// Hàm để submit form
function submitForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const fullName = formData.get('fullName');
    const gender = formData.get('gender');
    const dob = formData.get('dob');
    const accessToken = localStorage.getItem('stravaAccessToken');
    const athleteId = localStorage.getItem('athleteId');
    const stravaProfileUrl = localStorage.getItem('stravaProfileUrl');

    const data = {
        "data": [
            {
                "athleteId": athleteId,
                "fullName": fullName,
                "gender": gender,
                "dob": dob,
                "accessToken": accessToken,
                "stravaProfileUrl": stravaProfileUrl
            }
        ]
    }

    // Gửi dữ liệu lên Google Sheets qua SheetDB
    axios.post(sheetDbUrl, data)
        .then(response => {
            console.log('Dữ liệu đã được gửi thành công:', response.data);
            alert('Đăng ký thành công!');
        })
        .catch(error => {
            console.error('Lỗi khi gửi dữ liệu:', error);
            alert('Đăng ký thất bại, vui lòng thử lại.');
        });
}

document.getElementById('registrationForm').addEventListener('submit', submitForm);