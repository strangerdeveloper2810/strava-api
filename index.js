const clientId = '127128';
const clientSecret = 'b6097f741c5e7156764b8350179145222fa1cfa4';
const scope = 'read,activity:read_all';
const redirectUri = 'https://strava-api-dun.vercel.app/';
const sheetDbUrlRegistration = 'https://sheetdb.io/api/v1/6q0812gcbeszf';
const sheetDbUrlActivities = 'https://sheetdb.io/api/v1/2iethxwsa7ic3';
const sheetDbUrlChallenge = 'https://sheetdb.io/api/v1/ge9q0s695kxj2';

const athleteData = {};

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

    return axios.post(tokenUrl, null, { params: params });
}

// Hàm để làm mới access token từ Strava
function refreshAccessToken(refreshToken) {
    const tokenUrl = 'https://www.strava.com/oauth/token';
    const params = {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
    };

    return axios.post(tokenUrl, null, { params: params })
        .then(response => {
            const newAccessToken = response.data.access_token;
            const newRefreshToken = response.data.refresh_token;
            localStorage.setItem('stravaAccessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            return newAccessToken;
        })
        .catch(error => {
            console.error('Error refreshing access token:', error.response.data);
            throw new Error('Could not refresh access token');
        });
}

// Hàm để lấy danh sách hoạt động từ Strava
function fetchActivities() {
    let accessToken = localStorage.getItem('stravaAccessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';

    // Lấy ngày đầu tiên và ngày cuối cùng của tháng hiện tại
    const startOfMonth = moment().startOf('month').unix();
    const endOfMonth = moment().endOf('month').unix();

    const params = {
        after: startOfMonth,
        before: endOfMonth,
        page: 1,
        per_page: 200 // Số hoạt động trên mỗi trang, có thể thay đổi tùy nhu cầu
    };

    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    return axios.get(activitiesUrl, { params: params, headers: headers })
        .catch(error => {
            if (error.response.status === 401) {
                // Token hết hạn, làm mới token và thử lại
                return refreshAccessToken(refreshToken).then(newAccessToken => {
                    const newHeaders = {
                        Authorization: `Bearer ${newAccessToken}`
                    };
                    return axios.get(activitiesUrl, { params: params, headers: newHeaders });
                });
            } else {
                throw error;
            }
        });
}

// Hàm để lấy danh sách người đăng ký
function fetchRegistrations() {
    return axios.get(sheetDbUrlActivities);
}

// Các hàm khác không thay đổi...

// Kiểm tra nếu có mã code trong URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    fetchAccessToken(code)
        .then(response => {
            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            const athleteId = response.data.athlete.id;
            const fullName = `${response.data.athlete.firstname} ${response.data.athlete.lastname}`;

            localStorage.setItem('stravaAccessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('athleteId', athleteId);
            localStorage.setItem('fullName', fullName);

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
    const fullName = formData.get("fullName");
    const gender = formData.get("gender");
    const dob = formData.get("dob");
    const accessToken = localStorage.getItem("stravaAccessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const athleteId = localStorage.getItem("athleteId");
    const timestamp = new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
    });

    const registrationData = {
        data: [
            {
                "Mã Người Tham gia": athleteId,
                "Họ và Tên": fullName,
                "Giới tính": gender,
                "Ngày tháng năm sinh": dob,
                "Access Token": accessToken,
                "Refresh Token": refreshToken,
                Timestamp: timestamp,
            },
        ],
    };

    axios
        .post(sheetDbUrlRegistration, registrationData)
        .then((response) => {
            console.log("Dữ liệu đã được gửi thành công:", response.data);
            alert("Đăng ký thành công!");

            return fetchActivities();
        })
        .then((activityResponse) => {
            const activities = activityResponse.data;
            console.log("Activities:", activities);

            // Hàm để gửi dữ liệu hoạt động lên SheetDB với độ trễ
            function sendActivityData(activity, delay) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const activityData = {
                            "Mã Người Tham gia": athleteId,
                            "Họ và Tên": fullName,
                            Sport: activity.type,
                            "Start Time": moment(activity.start_date_local).format("DD/MM/YYYY"),
                            Date: moment(activity.start_date_local).format("DD/MM/YYYY"),
                            "Title/ Name": activity.name,
                            Distance: (activity.distance / 1000).toFixed(2),
                            "Moving Time": moment.utc(activity.moving_time).format("HH:mm"),
                            "Average Pace": activity.type === "Run" || activity.type === "Walk" ? moment.utc(activity.moving_time / activity.distance * 1000).format("mm:ss") : "",
                            "Average Speed": activity.type === "Ride" ? (activity.average_speed * 3.6).toFixed(2) : "",
                            "Elapsed time": moment.utc(activity.elapsed_time * 1000).format("HH:mm"),
                            "Average Elapsed Pace": activity.type === "Run" || activity.type === "Walk" ? moment.utc(activity.elapsed_time / activity.distance * 1000).format("mm:ss") : "",
                            "Average Elapsed Speed": activity.type === "Ride" ? (activity.elapsed_time * 3.6).toFixed(2) : "",
                            "Fastest Split Pace": activity.type === "Run" || activity.type === "Walk" ? moment.utc(activity.best_efforts?.[0]?.elapsed_time * 1000).format("mm:ss") : "",
                            "Max Speed": activity.type === "Ride" ? (activity.max_speed * 3.6).toFixed(2) : "",
                            Manual: activity.manual,
                            Tagged: activity.from_accepted_tag,
                        };

                        console.log("Sending activity data to SheetDB:", activityData);
                        axios.post(sheetDbUrlActivities, { data: [activityData] })
                            .then(resolve)
                            .catch((error) => {
                                console.error("Lỗi khi gửi dữ liệu hoạt động:", error);
                                resolve(); // Tiếp tục thực hiện các yêu cầu tiếp theo dù có lỗi
                            });
                    }, delay);
                });
            }

            const activityPromises = activities.map((activity, index) => {
                return sendActivityData(activity, index * 1000); // Gửi mỗi yêu cầu với độ trễ 1 giây
            });

            return Promise.all(activityPromises);
        })
        .then((results) => {
            console.log("Tất cả dữ liệu hoạt động đã được gửi thành công:", results);

            // Sau khi gửi xong dữ liệu hoạt động, gọi hàm xử lý và ghi dữ liệu vào sheet Challenge
            processAndSubmitChallengeData();
        })
        .catch((error) => {
            console.error("Lỗi khi xử lý:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        });
}

document.getElementById("registrationForm").addEventListener("submit", submitForm);