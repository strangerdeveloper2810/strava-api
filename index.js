// yêu cầu 1 và submit lên gg sheet
// const clientId = '127128';
// const clientSecret = 'b6097f741c5e7156764b8350179145222fa1cfa4';
// const scope = 'read,activity:read_all';
// const redirectUri = 'https://strava-api-dun.vercel.app/';
// const sheetDbUrl = 'https://sheetdb.io/api/v1/6q0812gcbeszf'

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
//             // Lấy các giá trị cần lưu từ response
//             const accessToken = response.data.access_token;
//             const athleteId = response.data.athlete.id;

//             // Lưu access token và thông tin người dùng vào localStorage hoặc state của ứng dụng
//             localStorage.setItem('stravaAccessToken', accessToken);
//             localStorage.setItem('athleteId', athleteId);

//             // Hiển thị thông báo authorize thành công
//             const statusMessage = document.createElement('div');
//             statusMessage.id = 'statusMessage';
//             statusMessage.textContent = 'Authorize thành công!';
//             statusMessage.style.display = 'block';
//             document.body.appendChild(statusMessage);
//         })
//         .catch(error => {
//             console.error('Error fetching access token:', error.response.data);
//             alert('Lỗi xảy ra khi lấy accessToken từ Strava.');
//         });
// }

// // Hàm để submit form
// function submitForm(event) {
//     event.preventDefault();

//     const formData = new FormData(event.target);
//     const fullName = formData.get('fullName');
//     const gender = formData.get('gender');
//     const dob = formData.get('dob');
//     const accessToken = localStorage.getItem('stravaAccessToken');
//     const athleteId = localStorage.getItem('athleteId');
//     const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

//     const data = {
//         "data": [
//             {
//                 "Mã Người Tham gia": athleteId,
//                 "Họ và Tên": fullName,
//                 "Giới tính": gender,
//                 "Ngày tháng năm sinh": dob,
//                 "Access Token": accessToken,
//                 "Timestamp": timestamp
//             }
//         ]
//     }

//     // Gửi dữ liệu lên Google Sheets qua SheetDB
//     axios.post(sheetDbUrl, data)
//         .then(response => {
//             console.log('Dữ liệu đã được gửi thành công:', response.data);
//             alert('Đăng ký thành công!');
//         })
//         .catch(error => {
//             console.error('Lỗi khi gửi dữ liệu:', error);
//             alert('Đăng ký thất bại, vui lòng thử lại.');
//         });
// }

// document.getElementById('registrationForm').addEventListener('submit', submitForm);
// Yêu cầu 1 và 2;
const clientId = '127128';
const clientSecret = 'b6097f741c5e7156764b8350179145222fa1cfa4';
const scope = 'read,activity:read_all';
const redirectUri = 'https://strava-api-dun.vercel.app/';
const sheetDbUrl = 'https://sheetdb.io/api/v1/6q0812gcbeszf';

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

// Hàm để lấy danh sách hoạt động từ Strava
function fetchActivities(accessToken) {
    const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
    const fromDate = moment('2024-06-01T00:00:00Z').format('YYYY-MM-DDTHH:mm:ss'); // Ngày bắt đầu lấy hoạt động
    const toDate = moment().format('YYYY-MM-DDTHH:mm:ss'); // Ngày hiện tại

    const params = {
        after: fromDate,
        before: toDate,
        access_token: accessToken
    };

    // Gửi yêu cầu GET để lấy danh sách hoạt động
    return axios.get(activitiesUrl, { params: params });
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

            // Sau khi lấy được access token, gửi yêu cầu lấy hoạt động từ Strava
            fetchActivities(accessToken)
                .then(activitiesResponse => {
                    const activities = activitiesResponse.data;
                    // Ghi thông tin hoạt động vào Google Sheets
                    activities.forEach(activity => {
                        saveActivityToSheet(activity, athleteId);
                    });
                })
                .catch(error => {
                    console.error('Error fetching activities:', error.response.data);
                    alert('Lỗi xảy ra khi lấy thông tin hoạt động từ Strava.');
                });
        })
        .catch(error => {
            console.error('Error fetching access token:', error.response.data);
            alert('Lỗi xảy ra khi lấy accessToken từ Strava.');
        });
}

// Hàm để ghi thông tin hoạt động vào Google Sheets qua SheetDB
function saveActivityToSheet(activity, athleteId) {
    const startDate = new Date(activity.start_date);
    const startTime = `${startDate.getHours()}:${('0' + startDate.getMinutes()).slice(-2)}`;
    const date = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
    const name = activity.name;
    const distance = (activity.distance / 1000).toFixed(2); // Convert meters to kilometers
    const movingTime = formatTime(activity.moving_time);
    const averagePace = formatPace(activity.average_speed); // For Run or Walk
    const averageSpeed = (activity.average_speed * 3.6).toFixed(2); // Convert m/s to km/h
    const elapsedTime = formatTime(activity.elapsed_time);
    const averageElapsedPace = formatPace(activity.average_speed); // For Run or Walk
    const averageElapsedSpeed = (activity.average_speed * 3.6).toFixed(2); // Convert m/s to km/h
    const fastestSplitPace = formatPace(activity.average_speed); // For Run or Walk
    const maxSpeed = (activity.max_speed * 3.6).toFixed(2); // Convert m/s to km/h
    const manual = activity.manual;
    const tagged = activity.commute;

    const data = {
        "data": [
            {
                "Mã Người Tham gia": athleteId,
                "Họ và Tên": "Họ và Tên của người dùng", // Cần lấy từ thông tin đăng nhập
                "Sport": activity.type,
                "Start Time": startTime,
                "Date": date,
                "Title/ Name": name,
                "Distance": distance,
                "Moving Time": movingTime,
                "Average Pace": averagePace,
                "Average Speed": averageSpeed,
                "Elapsed time": elapsedTime,
                "Average Elapsed Pace": averageElapsedPace,
                "Average Elapsed Speed": averageElapsedSpeed,
                "Fastest Split Pace": fastestSplitPace,
                "Max Speed": maxSpeed,
                "Manual": manual,
                "Tagged": tagged
            }
        ]
    };

    // Gửi dữ liệu hoạt động lên Google Sheets qua SheetDB
    axios.post(sheetDbUrl, data)
        .then(response => {
            console.log('Dữ liệu hoạt động đã được gửi thành công:', response.data);
        })
        .catch(error => {
            console.error('Lỗi khi gửi dữ liệu hoạt động:', error);
        });
}

// Hàm định dạng thời gian từ giây sang hh:mm:ss
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${('0' + minutes).slice(-2)}`;
}

// Hàm chuyển đổi tốc độ từ m/s sang phút/km hoặc km/h
function formatPace(speed) {
    if (speed > 0) {
        const paceMinPerKm = 1000 / speed / 60;
        return `${Math.floor(paceMinPerKm)}:${Math.round((paceMinPerKm % 1) * 60)}`;
    } else {
        return '0:00';
    }
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
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const data = {
        "data": [
            {
                "Mã Người Tham gia": athleteId,
                "Họ và Tên": fullName,
                "Giới tính": gender,
                "Ngày tháng năm sinh": dob,
                "Access Token": accessToken,
                "Timestamp": timestamp
            }
        ]
    };

    // Gửi dữ liệu thông tin người dùng lên Google Sheets qua SheetDB
    axios.post(sheetDbUrl, data)
        .then(response => {
            console.log('Dữ liệu thông tin người dùng đã được gửi thành công:', response.data);
            alert('Đăng ký thành công!');

            // Sau khi đăng ký thành công, gọi hàm lấy hoạt động từ Strava
            fetchActivities(accessToken)
                .then(activitiesResponse => {
                    const activities = activitiesResponse.data;
                    // Ghi thông tin hoạt động vào Google Sheets
                    activities.forEach(activity => {
                        saveActivityToSheet(activity, athleteId);
                    });
                })
                .catch(error => {
                    console.error('Error fetching activities:', error.response.data);
                    alert('Lỗi xảy ra khi lấy thông tin hoạt động từ Strava.');
                });
        })
        .catch(error => {
            console.error('Lỗi khi gửi dữ liệu thông tin người dùng:', error);
            alert('Đăng ký thất bại, vui lòng thử lại.');
        });
}

document.getElementById('registrationForm').addEventListener('submit', submitForm);