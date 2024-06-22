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

// Hàm để lấy danh sách hoạt động từ Strava
function fetchActivities(accessToken) {
    const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
    const fromDate = moment('2024-06-01T00:00:00Z').unix(); // Ngày bắt đầu lấy hoạt động, chuyển đổi thành timestamp giây
    const toDate = moment().unix(); // Ngày hiện tại, chuyển đổi thành timestamp giây

    const params = {
        after: fromDate,
        before: toDate
    };

    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    // Gửi yêu cầu GET để lấy danh sách hoạt động
    return axios.get(activitiesUrl, { params: params, headers: headers });
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
            const fullName = `${response.data.athlete.firstname} ${response.data.athlete.lastname}`;

            // Lưu access token và thông tin người dùng vào localStorage hoặc state của ứng dụng
            localStorage.setItem('stravaAccessToken', accessToken);
            localStorage.setItem('athleteId', athleteId);
            localStorage.setItem('fullName', fullName);

            // Hiển thị thông báo authorize thành công
            const statusMessage = document.createElement('div');
            statusMessage.id = 'statusMessage';
            statusMessage.textContent = 'Authorize thành công!';
            statusMessage.style.display = 'block';
            document.body.appendChild(statusMessage);

            // Lấy danh sách hoạt động và ghi vào Google Sheets
            fetchActivities(accessToken)
                .then(activityResponse => {
                    const activities = activityResponse.data;

                    activities.forEach(activity => {
                        const activityData = {
                            "Mã Người Tham gia": athleteId,
                            "Họ và Tên": fullName,
                            "Sport": activity.type,
                            "Start Time": moment(activity.start_date).format('HH:mm'),
                            "Date": moment(activity.start_date).format('DD/MM/YYYY'),
                            "Title/ Name": activity.name,
                            "Distance": (activity.distance / 1000).toFixed(2), // Convert to km
                            "Moving Time": moment.utc(activity.moving_time * 1000).format('HH:mm'),
                            "Average Pace": activity.type === 'Run' || activity.type === 'Walk' ? moment.utc(activity.average_speed * 1000).format('mm:ss') : '',
                            "Average Speed": activity.type === 'Ride' ? (activity.average_speed * 3.6).toFixed(2) : '', // Convert to km/h
                            "Elapsed time": moment.utc(activity.elapsed_time * 1000).format('HH:mm'),
                            "Average Elapsed Pace": activity.type === 'Run' || activity.type === 'Walk' ? moment.utc(activity.elapsed_time * 1000).format('mm:ss') : '',
                            "Average Elapsed Speed": activity.type === 'Ride' ? (activity.elapsed_time * 3.6).toFixed(2) : '',
                            "Fastest Split Pace": activity.type === 'Run' || activity.type === 'Walk' ? moment.utc(activity.best_efforts[0].elapsed_time * 1000).format('mm:ss') : '',
                            "Max Speed": activity.type === 'Ride' ? (activity.max_speed * 3.6).toFixed(2) : '',
                            "Manual": activity.manual,
                            "Tagged": activity.flagged
                        };

                        // Gửi dữ liệu hoạt động lên Google Sheets qua SheetDB
                        axios.post(sheetDbUrl, { data: [activityData] })
                            .then(sheetResponse => {
                                console.log('Dữ liệu hoạt động đã được gửi thành công:', sheetResponse.data);
                            })
                            .catch(sheetError => {
                                console.error('Lỗi khi gửi dữ liệu hoạt động:', sheetError);
                            });
                    });
                })
                .catch(activityError => {
                    console.error('Lỗi khi lấy danh sách hoạt động:', activityError);
                });
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