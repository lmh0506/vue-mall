<template>
    <div>
      <v-header ref="header"></v-header>
      <v-bread>
        <span>Goods</span>
      </v-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a @click="sortGoods()" href="javascript:void(0)" class="price" >Price 
              <svg class="icon icon-arrow-short" :class="{'sort-up': !sortFlag}">
                <use xlink:href="#icon-arrow-short"></use>
              </svg>
            </a>
            <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" :class="{'filterby-show': filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd>
                  <a href="javascript:void(0)" :class="{'cur': priceChecked === 'all'}" @click="setPriceFilter('all')">All</a>
                </dd>
                <dd v-for="(item, index) in priceFilter" :key="index">
                  <a href="javascript:void(0)" :class="{'cur': priceChecked === index}" @click="setPriceFilter(index)">{{item.startPrice}} - {{item.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="(item, index) in goodsList" :key="index">
                    <div class="pic">
                      <a href="#"><img v-lazy="`/static/${item.productImage}`" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" @click="addCart(item.productId)" class="btn btn--m">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10" style="text-align:center">
                <img v-show="loading" src="/static/loading-svg/loading-spinning-bubbles.svg" alt="">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
      <v-footer></v-footer>
      <modal :mdShow='mdShow' @closeModal='closeModal'>
        <p slot="message">
          {{modalMsg}}
        </p>
        <div slot="btnGroup">
          <a href="javascript:;" @click="closeModal" class="btn btn--m">关闭</a>
        </div>
      </modal>
    </div>
</template>

<script>
  import VHeader from '../components/header'
  import VFooter from '../components/footer'
  import VBread from '../components/bread'
  import Modal from '../components/Modal'
  import axios from 'axios'
  export default {
    data () {
      return {
        goodsList: [],
        priceFilter: [
          {
            startPrice: '0.00',
            endPrice: '100.00'
          },
          {
            startPrice: '100.00',
            endPrice: '500.00'
          },
          {
            startPrice: '500.00',
            endPrice: '1000.00'
          },
          {
            startPrice: '1000.00',
            endPrice: '2000.00'
          }
        ],
        priceChecked: 'all',
        filterBy: false,
        overLayFlag: false,
        sortFlag: true,
        page: 1,
        busy: true,
        loading: false,
        mdShow: false,
        modalMsg: ''
      }
    },
    methods: {
      getGoodsList (moreFlag) { // 获取商品数据
        let params = {
          page: this.page,
          sort: this.sortFlag ? 1 : -1,
          priceLevel: this.priceChecked
        }
        this.loading = true
        axios.get('/goods', {params}).then(res => {
          if (res.data.status === 0) {
            let list = res.data.result.list
            // 如果是加载更多则拼接数组
            this.goodsList = moreFlag ? this.goodsList.concat(list) : list
            if (res.data.result.count === 0) { // 如果没有更多数据  则将busy设置为true禁止滚动加载
              this.busy = true
            } else {
              this.busy = false
            }
            this.loading = false
          }
        })
      },
      showFilterPop () { // 移动端模式下 显示右侧过滤菜单
        this.filterBy = true
        this.overLayFlag = true
      },
      closePop () { // 移动端模式下 关闭右侧过滤菜单
        this.filterBy = false
        this.overLayFlag = false
      },
      setPriceFilter (index) { // 设置过滤参数
        this.priceChecked = index
        this.closePop()
        this.page = 1
        this.getGoodsList()
      },
      sortGoods () { // 按价格排序并获取数据
        this.sortFlag = !this.sortFlag
        this.page = 1
        this.getGoodsList()
      },
      loadMore () { // 加载更多数据
        this.page ++
        this.getGoodsList(true)
      },
      addCart (productId) {
        axios.post('/goods/addCart', {productId}).then(res => {
          if (res.data.status === 0) {
            this.mdShow = true
            this.modalMsg = '加入成功'
          } else {
            this.$refs.header.showModal()
          }
        })
      },
      closeModal () {
        this.mdShow = false
      }
    },
    components: {
      VHeader,
      VFooter,
      VBread,
      Modal
    },
    mounted () {
      this.getGoodsList()
    }
  }
</script>

<style scoped>
    @import '../assets/css/product.css';
</style>

