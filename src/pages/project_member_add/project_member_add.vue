<template>
    <div id="app">
        <div class="project-member-add">
            <div class="project-name">
                未注册人员
            </div>
            <div class="project-member-add-item">
                <input type="text" class="weui-input add-people" placeholder="输入姓名点击添加" v-model="newName"/>
                <div class="add-btn" :class="newName?'':'weui-btn_disabled'"
                     @click="addNewName">添加
                </div>
            </div>
            <ul class="unregister-members">
                <li v-for="(name,nameIndex) in names">
                    <div>{{name}} 
                        <span @click="removeNewName(nameIndex)">
                            <!-- <img src="../../assets/images/icon-remove.png"/> -->
                            ×
                        </span>
                    </div>
                </li>
            </ul>
        </div>
        <!-- <div style="height: 8px;width: 100%;background: #ececec"></div> -->
        <div class="project-member-add" style="padding-bottom: 36px;">
            <div class="project-name">
                注册人员(多选)
            </div>
            <ul class="register-members">
                <li :class="user.selected?'active':''" v-for="user in users" @click="user.selected=(!user.selected)">
                    <div class="headerImg">
                        <img :src="user.avatarUrl">
                    </div>
                    <div style="width: 100px; display: inline-block; padding-left:15px;">
                        <span  class="name" v-text="user.juname"></span>
                        <span  class="mobile" v-text="user.mobile"></span>
                    </div>
                    <span class="status" style="line-height: 56px;"><img class="isShowImg" src="../../assets/images/icon-right.png"></span>
                </li>
            </ul>
        </div>
        <div class="project-member-buttons" >
            <div class="save" @click="save">确认</div>
            <div class="cancel" @click="closeWindow">取消</div>
        </div>
    </div>
</template>

<script>
  import {createProjectMember, getRegisteredUsers} from "../../utils/DataUtils";
  import {closeWindow, getPageParams, toast} from "../../utils/ApiCloudUtils";

  export default {
    name: 'app',
    computed: {
      footerHeight() {
        return this.paddingBottom + 40
      }
    },
    data() {
      return {
        newName: '',
        paddingBottom: 0,
        names: [],
        users: [],
        get selectedUserId() {
          return this.users.filter(user => user.selected).map(user => user.juid);
        },
        get canSubmit() {
          return this.names.length > 0 || this.selectedUserId.length > 0;
        },
        projectId: 0
      };
    },
    async created() {
      let {d} = await getRegisteredUsers();
      if (d) {
        this.users = d.map(u => {
          u.selected = false;
          return u;
        });
      }
      let {projectId} = await getPageParams();
      this.projectId = projectId;
      this.paddingBottom = window.api.safeArea.bottom;
    },
    watch: {
        users() {
            console.log(this.users[0])
        }
    },
    methods: {
      closeWindow,
      addNewName() {
        if (!this.newName) {
          return;
        }

        this.names.push(this.newName);
        this.newName = '';
      },
      removeNewName(index) {
        this.names.splice(index, 1);
      },
      async save() {
        if (!this.canSubmit) {
          return toast('请输入未注册的用户姓名或者选择注册用户');
        }
        let users = [];
        this.names.forEach(name => users.push({name}));
        this.selectedUserId.forEach(userId => users.push({userId}));

        let {c, m} = await createProjectMember(this.projectId, users);
        if (c !== 0) {
          return;
        }
        toast(m);
        this.names = [];
        this.users.forEach(user => user.selected = false);
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-member-add {
        padding: 0 14px;

        .project-name {
            position: relative;
            // padding-left: 26px;
            padding-top: 20px;
            padding-bottom: 20px;
            letter-spacing: 1px;
            line-height: 24px;
            background-color: #fff;
            font-size: 20px;
            color: #22242A;

            // &:before {
            //     position: absolute;
            //     content: ' ';
            //     left: 11px;
            //     top: 20.5px;
            //     width: 5.5px;
            //     height: 22px;
            //     background: rgb(63, 103, 233);
            //     -webkit-border-radius: 3.8px;
            //     -moz-border-radius: 3.8px;
            //     border-radius: 3.8px;
            // }
        }
        .project-member-add-item {
            position: relative;
            padding-left: 8px;
            padding-right: 30px;
            padding-bottom: 24px;

            .add-people {
                height: 46px;
                border-radius: 23px;
                width: 90%;
            }

            .add-btn {
                position: absolute;
                // background: pink;
                font-size: 14px;
                color: #6478D3;
                right: 10px;
                top: 0;
                height: 46px;
                line-height: 46px;
            }

            // &:after {
            //     position: absolute;
            //     content: ' ';
            //     left: 8px;
            //     right: 8px;
            //     bottom: 0;
            //     height: 1px;
            //     background-color: #eee;
            //     -webkit-transform: scaleY(0.5);
            //     -moz-transform: scaleY(0.5);
            //     -ms-transform: scaleY(0.5);
            //     -o-transform: scaleY(0.5);
            //     transform: scaleY(0.5);
            // }
            & > * {
                height: 35px;
                line-height: 35px;
            }

            input {
                padding-left: 10px;
                background-color: #F7F8FA;
                color: #7f7f7f;
                font-size: 15px;
                letter-spacing: 1px;
                -webkit-border-radius: 5px;
                -moz-border-radius: 5px;
                border-radius: 5px;
            }
            .weui-btn {
                position: absolute;
                top: 0;
                right: 14px;
                width: 90px;
            }
        }
        .unregister-members {
            list-style: none;
            padding: 14px 8px 40px 8px;

            li {
                display: inline-block;
                position: relative;
                min-width: 32%;
                margin-bottom: 12px;
                padding-right: 20px;

                div {
                    position: relative;
                    height: 30px;
                    font-size: 15px;
                    line-height: 30px;
                    text-align: center;
                    color: #7f7f7f;
                    background: #F7F8FA;
                    -webkit-border-radius: 15px;
                    -moz-border-radius: 15px;
                    border-radius: 15px;
                    padding-right: 20px;
                }
                span {
                    width: 20px;
                    height: 30px;
                    position: absolute;
                    // display: block;
                    right: 5px;
                    top: 50%;
                    margin-top: -15px;
                    font-weight: 700;
                    // width: 20px;
                    // height: 20px;
                    // img {
                    //     width: 19px;
                    //     height: 19px;
                    // }
                }
            }
        }
        .register-members {
            list-style: none;
            li {
                position: relative;
                padding: 20px 8px;
                height: auto;
                // line-height: 56px;
                color: #7f7f7f;
                font-size: 15px;
                .headerImg {
                    width: 48px;
                    height: 48px;
                    border-radius: 24px;
                    display: inline-block;
                    border-radius: 24px;
                    overflow: hidden;
                    img {
                        width: 100%;
                    }
                }
                span {
                    display: inline-block;
                }

                span.name {
                    width: 126px;
                    font-size: 14px;
                    color: #22242A;
                }
                span.mobile {
                    font-size: 12px;
                    color: #8D92A3;
                }

                span.status {
                    float: right;
                    width: 46px;
                }
                .isShowImg {
                    display: none;
                    width: 20px;
                    height: 11.5px;
                }

                &.active {
                    img {
                        display: inline-block;
                    }
                    span.name,
                    span.mobile {
                        // color: @baseColor;
                    }
                }
                &:first-child:before {
                    width: 0;
                }
                // &:first-child:before,
                &:after {
                    position: absolute;
                    content: ' ';
                    left: 75px;
                    right: 8px;
                    height: 1px;
                    background-color: #eee;
                    -webkit-transform: scaleY(0.5);
                    -moz-transform: scaleY(0.5);
                    -ms-transform: scaleY(0.5);
                    -o-transform: scaleY(0.5);
                    transform: scaleY(0.5);
                    width: 260px;
                }
                &:after {
                    bottom: 0;
                }
                &:first-child:before {
                    top: 0;
                }
                &:active {
                    background-color: #eee;
                }
            }
        }
    }

    .project-member-buttons {
        position: fixed;
        justify-content: space-around;
        bottom: 0;
        left: 0;
        right: 0;
        // height: 46px;
        text-align: center;
        line-height: 46px;
        display: flex;
        display: -webkit-flex;
        font-size: 15px;
        // margin-bottom: 10px;
        padding-bottom: 2.5%;
        background: #fff;
        & > div {
            // flex: 1;

            &.save {
                color: #fff;
                background-color: #6478D3;
                width: 43%;
                height: 46px;
                border-radius: 23px;
                &:active {
                    background-color: @baseColorActive;
                }
            }
            &.cancel {
                color: #FFF;
                background-color: #CDCDD7;
                width: 43%;
                height: 46px;
                border-radius: 23px;
                &:active {
                    background-color: #b3b3b3;
                }
            }
        }
    }
</style>
