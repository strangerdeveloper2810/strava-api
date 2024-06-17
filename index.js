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
const redirectUri = 'https://strava-api-ten.vercel.app';

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

// Hàm xử lý submit form để chỉ console.log các giá trị nhập vào form
function submitForm(event) {
    event.preventDefault(); // Ngăn chặn form reload trang

    // Lấy dữ liệu từ form
    const formData = new FormData(event.target);

    // Tạo object từ formData để dễ dàng truy cập dữ liệu
    const formValues = {};
    formData.forEach((value, key) => {
        formValues[key] = value;
        console.log({ formValues, key, value });
    });

    // In ra console các giá trị mà người dùng nhập vào form
    console.log('Dữ liệu từ form:', formValues);

    // Reset form sau khi log dữ liệu (nếu cần)
    event.target.reset();
}

// Kiểm tra nếu có mã code trong URL (được trả về sau khi người dùng ủy quyền thành công)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    // Gửi yêu cầu lấy access token từ Strava và xử lý kết quả
    fetchAccessToken(code)
        .then(response => {
            // Lấy access token từ response
            const accessToken = response.data.access_token;
            console.log('Access Token:', accessToken);

            // Lưu access token vào localStorage
            localStorage.setItem('stravaAccessToken', accessToken);

            // Hiển thị thông báo authorize thành công (ví dụ: dùng một div có id "statusMessage" để hiển thị)
            document.getElementById('statusMessage').textContent = 'Authorize thành công!';
            document.getElementById('statusMessage').style.color = 'green';
            document.getElementById('statusMessage').style.display = 'block';

            // Sau khi lấy được access token, bạn có thể thực hiện các thao tác khác như gọi API Strava để lấy thông tin người dùng, hoạt động, vv.
        })
        .catch(error => {
            console.error('Error fetching access token:', error.response.data);
            alert('Lỗi xảy ra khi lấy accessToken từ Strava.');
        });
}
