import React, { useState, useEffect } from "react";
import moment from "moment";
import { graphql } from "gatsby";
import SEO from "../components/SEO";
import parser from "html-react-parser";
import Layout from "../components/Layout";
import { useLocation } from "@reach/router";
import { onEntryChange } from "../live-preview-sdk/index";
import ArchiveRelative from "../components/ArchiveRelative";
import RenderComponents from "../components/RenderComponents";
import { getPageRes, getBlogPostRes, jsonToHtmlParse } from "../helper";
import { PageProps } from "../typescript/template";

const blogPost = ({
  data: { contentstackBlogPost, contentstackPage },
}: PageProps) => {
  const { pathname } = useLocation();
  jsonToHtmlParse(contentstackBlogPost);

  const [getEntry, setEntry] = useState({
    banner: contentstackPage,
    post: contentstackBlogPost,
  });

  async function fetchData() {
    try {
      let sanitizedUrl = pathname;
      sanitizedUrl = sanitizedUrl.replace(/\/$/, "");
      const entryRes = await getBlogPostRes(sanitizedUrl);
      const bannerRes = await getPageRes("/blog");
      if (!entryRes || !bannerRes) throw new Error("Error 404");
      setEntry({ banner: bannerRes, post: entryRes });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, [contentstackBlogPost, contentstackPage]);
  return (
    <Layout blogPost={getEntry.post} banner={getEntry.banner}>
      <SEO title={getEntry.post.title} />
      <RenderComponents
        components={getEntry.banner.page_components}
        blogPage
        contentTypeUid="blog_post"
        entryUid={getEntry.banner.uid}
        locale={getEntry.banner.locale}
      />
      <div className="blog-container">
        <div className="blog-detail">
          <h2 {...getEntry.post.$?.title}>
            {getEntry.post.title ? getEntry.post.title : ""}
          </h2>
          <span>
            <p>
              {moment(getEntry.post.date).format("ddd, MMM D YYYY")},{" "}
              <strong {...getEntry.post.author[0]?.$?.title}>
                {getEntry.post.author[0]?.title}
              </strong>
            </p>
          </span>
          <span {...getEntry.post.$?.body}>{parser(getEntry.post.body)}</span>
        </div>
        <div className="blog-column-right">
          <div className="related-post">
            {getEntry.banner.page_components[2].widget && (
              <h2 {...getEntry.banner.page_components[2]?.widget.$?.title_h2}>
                {getEntry.banner.page_components[2].widget.title_h2}
              </h2>
            )}
            <ArchiveRelative
              data={getEntry.post.related_post && getEntry.post.related_post}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const postQuery = graphql`
  query ($title: String!) {
    contentstackBlogPost(title: { eq: $title }) {
      url
      title
      body
      uid
      locale
      date
      author {
        title
        bio
        picture {
          url
        }
      }
      related_post {
        body
        url
        title
        date
      }
      seo {
        enable_search_indexing
        keywords
        meta_description
        meta_title
      }
    }
    contentstackPage(url: { eq: "/blog" }) {
      title
      url
      uid
      locale
      seo {
        enable_search_indexing
        keywords
        meta_description
        meta_title
      }
      page_components {
        contact_details {
          address
          email
          phone
        }
        from_blog {
          title_h2
          featured_blogs {
            title
            uid
            url
            is_archived
            featured_image {
              url
              uid
            }
            body
            author {
              title
              uid
              bio
            }
          }
          view_articles {
            title
            href
          }
        }
        hero_banner {
          banner_description
          banner_title
          bg_color
          call_to_action {
            title
            href
          }
        }
        our_team {
          title_h2
          description
          employees {
            name
            designation
            image {
              url
              uid
            }
          }
        }
        section {
          title_h2
          description
          image {
            url
            uid
          }
          image_alignment
          call_to_action {
            title
            href
          }
        }
        section_with_buckets {
          title_h2
          description
          buckets {
            title_h3
            description
            icon {
              url
              uid
            }
            call_to_action {
              title
              href
            }
          }
        }
        section_with_cards {
          cards {
            title_h3
            description
            call_to_action {
              title
              href
            }
          }
        }
        widget {
          title_h2
          type
        }
      }
    }
  }
`;
export default blogPost;
