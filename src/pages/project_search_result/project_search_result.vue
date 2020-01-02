<template>
    <div id="app">
        <div class="project-search-result-container">
            <ul>
                <li class="contract">合同额（万）<span v-text="statistic.contractMoney"></span></li>
                <li class="income">进款统计（万）<span v-text="statistic.incomeSum"></span></li>
                <li class="spend">出款统计（万）<span v-text="statistic.spendSum"></span></li>
            </ul>
        </div>
        <div style="height: 7px;background-color: #e8e8e8;"></div>
        <ProjectItem :rows="projects"/>
    </div>
</template>

<script>
  import {getPageParams, listenPage, pullRefresh, pullRefreshDone} from "../../utils/ApiCloudUtils";
  import {getProjects, getProjectStatistic} from "../../utils/DataUtils";
  import ProjectItem from '../../components/ProjectItem'

  export default {
    name: 'app',
    components: {ProjectItem},
    data() {
      return {
        searchProjectForm: {
          ownerUnit: null,
          contractSumBegin: null,
          contractSumEnd: null,
          createDateBegin: null,
          createDateEnd: null,
          businessNature: null,
          status: null,
          dpids: [],
          inchargeUsersId: [],

          pageNumber: 1,
        },
        projects: [],
        statistic: {
          incomeSum: '计算中...',
          spendSum: '计算中...',
          contractMoney: '计算中...'
        }
      };
    },
    async created() {
      let {searchProjectForm} = await getPageParams();
      let {
        contractSumBegin = null,
        ownerUnit = null,
        contractSumEnd = null,
        createDateBegin = null,
        createDateEnd = null,
        businessNature = null,
        status = null,
        dpids = [],
        inchargeUsersId = []
      } = searchProjectForm;

      this.searchProjectForm.ownerUnit = ownerUnit;
      this.searchProjectForm.contractSumBegin = contractSumBegin;
      this.searchProjectForm.contractSumEnd = contractSumEnd;
      this.searchProjectForm.createDateBegin = createDateBegin;
      this.searchProjectForm.createDateEnd = createDateEnd;
      this.searchProjectForm.businessNature = businessNature;
      this.searchProjectForm.status = status;

      if (dpids) {
        this.searchProjectForm.dpidsText = dpids.join(',');
      }
      if (inchargeUsersId) {
        this.searchProjectForm.inchargeUsersIdText = inchargeUsersId.join(',')
      }

      this.getData();
      this.getStatistic();

      pullRefresh(async () => {
        this.searchProjectForm.pageNumber = 1;
        this.getStatistic();
        await this.getData();
        pullRefreshDone();
      });
    },
    methods: {
      async getData() {
        let {c, m, d} = await getProjects(this.searchProjectForm);
        if (c !== 0) {
          return;
        }

        let {rows, pages} = d;
        this.projects = this.searchProjectForm.pageNumber === 1 ? rows : this.projects.concat(rows);

        if (this.searchProjectForm.pageNumber < pages) {
          this.searchProjectForm.page++;
          listenPage(() => {
            this.getData();
          });
        }
      },
      async getStatistic() {
        let {c, d} = await getProjectStatistic(this.searchProjectForm);
        if (c !== 0) {
          return;
        }

        d = d || {contractMoney: 0, incomeSum: 0, spendSum: 0};

        let {contractMoney = 0, incomeSum = 0, spendSum = 0} = d;

        this.statistic.contractMoney = '+' + (contractMoney / 10000).toFixed(2);
        this.statistic.incomeSum = '+' + (incomeSum / 10000).toFixed(2);
        this.statistic.spendSum = '-' + (spendSum / 10000).toFixed(2);
      }
    }
  }
</script>

<style lang="less">
    @import "../../assets/style";

    .project-search-result-container {
        padding: 13px 15px 52px;
        ul {
            padding: 12px 13px;
            list-style: none;
            box-shadow: 1.7px 1.1px 24.5px rgba(235, 240, 255, 0.83);
        }
        li {
            position: relative;
            padding-left: 30px;
            height: 30px;
            line-height: 30px;
            font-size: 14px;

            &:before {
                position: absolute;
                content: '';
                left: 0;
                top: 0;
                height: 30px;
                width: 30px;
                background-size: 16px auto;
                background-repeat: no-repeat;
                background-position: center;
            }

            span {
                float: right;
                font-size: 16px;
                color: @baseColor;
            }

            &.spend {
                span {
                    color: #f76868;
                }

                &:before {
                    background-image: data-uri('image/png;base64', '../../assets/images/icon-spend.png');
                }
            }

            &.contract:before {
                background-image: data-uri('image/png;base64', '../../assets/images/icon-contract.png')
            }
            &.income:before {
                background-image: data-uri('image/png;base64', '../../assets/images/icon-incomsum.png')
            }
        }
    }
</style>
