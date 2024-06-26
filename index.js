const clientId = '127128';
const clientSecret = 'b6097f741c5e7156764b8350179145222fa1cfa4';
const scope = 'read,activity:read_all';
const redirectUri = 'https://strava-api-dun.vercel.app/';
const sheetDbUrlRegistration = 'https://sheetdb.io/api/v1/6q0812gcbeszf';
const sheetDbUrlActivities = 'https://sheetdb.io/api/v1/2iethxwsa7ic3';
const sheetDbUrlChallenge = 'https://sheetdb.io/api/v1/ge9q0s695kxj2';
const accessTokenCustomer = "359b0711f3da2341df51b6de507f6ea5762bb4b9";
const athleteIdCustomer = "48680729";

const athleteData = {}

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

// Hàm để lấy danh sách hoạt động từ Strava
function fetchActivities(accessTokenCustomer) {
    const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
    const toDate = moment().unix(); // Ngày hiện tại, chuyển đổi thành timestamp giây

    const params = {
        before: toDate
    };

    const headers = {
        Authorization: `Bearer ${accessTokenCustomer}`
    };

    return axios.get(activitiesUrl, { params: params, headers: headers });
}

// Hàm để lấy danh sách người đăng ký
function fetchRegistrations() {
    return axios.get(sheetDbUrlActivities);
}

// Hàm để kiểm tra tính hợp lệ của hoạt động
function isValidActivity(activity) {
    const distance = activity.distance / 1000; // Chuyển đổi sang km
    const elapsedPace = activity.elapsed_time / activity.distance; // Tính pace theo giây/m
    const fastestSplitPace = activity.best_efforts?.[0]?.elapsed_time / activity.distance; // Tính fastest split pace theo giây/m

    if (activity.manual || activity.from_accepted_tag) {
        return false;
    }

    switch (activity.type) {
        case 'Run':
        case 'Walk':
            return distance >= minDistanceWalkRun &&
                elapsedPace >= minPaceWalkRun &&
                elapsedPace <= maxPaceWalkRun &&
                fastestSplitPace <= fastestSplitPaceWalkRun;
        case 'Ride':
            const averageSpeed = activity.average_speed * 3.6; // Chuyển đổi sang km/h
            return distance >= minDistanceRide &&
                averageSpeed >= minSpeedRide &&
                averageSpeed <= maxSpeedRide;
        default:
            return false;
    }
}

// Hàm để xử lý dữ liệu và ghi vào bảng Challenge
function processAndSubmitChallengeData() {
    fetchRegistrations()
        .then(response => {
            const registrations = response.data;
            const athleteData = {};

            registrations.forEach(reg => {
                const athleteId = reg['Mã Người Tham gia'];
                athleteData[athleteId] = {
                    fullName: reg['Họ và Tên'],
                    totalDistance: 0,
                    totalDays: 0,
                    startDate: null,
                    endDate: null,
                    distancesByDate: {}
                };
            });

            const accessToken = localStorage.getItem("stravaAccessToken");
            return fetchActivities(accessToken);
        })
        .then(activityResponse => {
            const activities = activityResponse.data;

            activities.forEach(activity => {
                if (!isValidActivity(activity)) return;

                const athleteId = localStorage.getItem("athleteId");
                const activityDate = moment(activity.start_date_local).format('DD/MM');
                const distance = activity.type === 'Ride' ? (activity.distance / 1000) / 4 : activity.distance / 1000;

                if (!athleteData[athleteId].distancesByDate[activityDate]) {
                    athleteData[athleteId].distancesByDate[activityDate] = 0;
                    athleteData[athleteId].totalDays++;
                }

                athleteData[athleteId].distancesByDate[activityDate] += distance;
                athleteData[athleteId].totalDistance += distance;

                if (!athleteData[athleteId].startDate || moment(activity.start_date_local).isBefore(athleteData[athleteId].startDate)) {
                    athleteData[athleteId].startDate = moment(activity.start_date_local);
                }
                if (!athleteData[athleteId].endDate || moment(activity.start_date_local).isAfter(athleteData[athleteId].endDate)) {
                    athleteData[athleteId].endDate = moment(activity.start_date_local);
                }
            });

            const challengeData = Object.values(athleteData).map(athlete => ({
                "Họ và Tên": athlete.fullName,
                "Tổng quãng đường": athlete.totalDistance.toFixed(2),
                "Tổng số ngày có hoạt động": athlete.totalDays,
                "Ngày 1": athlete.startDate ? athlete.startDate.format('DD/MM') : '',
                "Ngày kết thúc": athlete.endDate ? athlete.endDate.format('DD/MM') : '',
                ...athlete.distancesByDate
            }));

            console.log({ challengeData });

            return axios.post(sheetDbUrlChallenge, { data: challengeData });
        })
        .then(response => {
            console.log("Ghi dữ liệu vào Challenge thành công:", response.data);
        })
        .catch(error => {
            console.error("Lỗi khi xử lý dữ liệu Challenge:", error);
        });
}

// Sự kiện khi người dùng nhấn vào nút "Đăng nhập Strava"
document.getElementById('authorizeBtn').addEventListener('click', () => {
    const stravaAuthorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    window.location.href = stravaAuthorizeUrl;
});

// Kiểm tra nếu có mã code trong URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    fetchAccessToken(code)
        .then(response => {
            const accessToken = response.data.access_token;
            const athleteId = response.data.athlete.id;
            const fullName = `${response.data.athlete.firstname} ${response.data.athlete.lastname}`;

            localStorage.setItem('stravaAccessToken', accessToken);
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
                Timestamp: timestamp,
            },
        ],
    };

    axios
        .post(sheetDbUrlRegistration, registrationData)
        .then((response) => {
            console.log("Dữ liệu đã được gửi thành công:", response.data);
            alert("Đăng ký thành công!");

            return fetchActivities(accessTokenCustomer);
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
                            "Start Time": moment(activity.start_date_local).format("HH:mm"),
                            Date: moment(activity.start_date_local).format("DD/MM/YYYY"),
                            "Title/ Name": activity.name,
                            Distance: (activity.distance / 1000).toFixed(2),
                            "Moving Time": moment.utc(activity.moving_time * 1000).format("HH:mm"),
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