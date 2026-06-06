const { STORAGE_KEYS } = require('../../utils/constants');
const { getUserProfile, saveUserProfile } = require('../../utils/data');

const genderOptions = [
  { label: '不展示', value: 0 },
  { label: '男生', value: 1 },
  { label: '女生', value: 2 }
];

const roleOptions = [
  { label: '不展示', value: 'hidden' },
  { label: '我是自己', value: 'self' },
  { label: '我是对方', value: 'partner' }
];

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    genderIndex: 0,
    roleIndex: 0,
    birthday: '',
    visibleToPartner: true,
    genderOptions,
    roleOptions
  },

  async onLoad() {
    const profile = await getUserProfile(STORAGE_KEYS.PROFILE);
    const genderIndex = Math.max(0, genderOptions.findIndex((item) => item.value === profile.gender));
    const roleIndex = Math.max(0, roleOptions.findIndex((item) => item.value === profile.role));

    this.setData({
      avatarUrl: profile.avatarUrl || '',
      nickName: profile.nickName || '',
      genderIndex,
      roleIndex,
      birthday: profile.birthday || '',
      visibleToPartner: profile.visibleToPartner !== false
    });
  },

  onChooseAvatar(event) {
    this.setData({
      avatarUrl: event.detail.avatarUrl
    });
  },

  onNickNameInput(event) {
    this.setData({
      nickName: event.detail.value
    });
  },

  onGenderChange(event) {
    this.setData({
      genderIndex: Number(event.detail.value)
    });
  },

  onRoleChange(event) {
    this.setData({
      roleIndex: Number(event.detail.value)
    });
  },

  onBirthdayChange(event) {
    this.setData({
      birthday: event.detail.value
    });
  },

  onVisibleChange(event) {
    this.setData({
      visibleToPartner: event.detail.value
    });
  },

  async save() {
    if (!this.data.nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    await saveUserProfile(STORAGE_KEYS.PROFILE, {
      avatarUrl: this.data.avatarUrl,
      nickName: this.data.nickName,
      gender: genderOptions[this.data.genderIndex].value,
      genderText: genderOptions[this.data.genderIndex].label,
      role: roleOptions[this.data.roleIndex].value,
      roleText: roleOptions[this.data.roleIndex].label,
      birthday: this.data.birthday,
      visibleToPartner: this.data.visibleToPartner
    });
    wx.hideLoading();
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
