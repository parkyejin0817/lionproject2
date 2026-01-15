import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as mentorApi from '@/api/mentor';
import type { Mentor, Skill } from '@/api/mentor';

export default function MentorListPage() {
  const [searchParams] = useSearchParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('createdAt,desc');

  // URL 쿼리 파라미터에서 검색어 읽기
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      // #으로 시작하는 경우 제거
      const cleanQuery = q.startsWith('#') ? q.substring(1) : q;
      setSearchKeyword(cleanQuery);
    }
  }, [searchParams]);

  // Fetch skills on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await mentorApi.getSkills();
        if (response.success && response.data) {
          setSkills(response.data);
        }
      } catch {
        console.error('Failed to fetch skills');
      }
    };
    fetchSkills();
  }, []);

  // Fetch mentors
  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await mentorApi.getMentors({
          page,
          size: 9,
          sort: sortBy,
        });
        if (response.success && response.data) {
          setMentors(response.data.content);
          setTotalPages(response.data.totalPages);
          setTotalElements(response.data.totalElements);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '멘토 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, [page, sortBy]);

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter mentors by selected skills (client-side for now)
  // 선택된 스킬 ID로 스킬 이름 찾기
  const selectedSkillNames = skills
    .filter(s => selectedSkills.includes(s.id))
    .map(s => s.name.toLowerCase());

  const filteredMentors = selectedSkills.length > 0
    ? mentors.filter((mentor) =>
        mentor.skills.some((skill) => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return selectedSkillNames.includes(skillName.toLowerCase());
        })
      )
    : mentors;

  // Filter by search keyword (client-side)
  const searchedMentors = searchKeyword
    ? filteredMentors.filter(
        (mentor) =>
          mentor.nickname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          mentor.skills.some((skill) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            return skillName.toLowerCase().includes(searchKeyword.toLowerCase());
          })
      )
    : filteredMentors;

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Tech Stack Filter */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  기술 스택
                </h3>
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <label key={skill.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-900"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary">
                        {skill.name}
                      </span>
                    </label>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-slate-400">스킬 목록을 불러오는 중...</p>
                  )}
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              {/* Rating Filter */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  최소 평점
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      className="text-primary focus:ring-primary dark:bg-slate-900"
                    />
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4].map((i) => (
                        <span key={i} className="material-symbols-outlined text-sm">star</span>
                      ))}
                      <span className="material-symbols-outlined text-sm text-slate-300 dark:text-slate-600">star</span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">4.0+</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">나의 멘토 찾기</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {totalElements}명의 숙련된 개발자가 1:1 세션을 위해 대기 중입니다
                  </p>
                </div>
              </div>

              {/* Search & Sort */}
              <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="멘토 이름 또는 기술 스택 검색"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm shadow-sm"
                  />
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:w-auto text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 cursor-pointer shadow-sm"
                  >
                    <option value="createdAt,desc">최신순</option>
                    <option value="averageRating,desc">평점 높은 순</option>
                    <option value="reviewCount,desc">리뷰 많은 순</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
                {error}
              </div>
            )}

            {/* Mentor Grid */}
            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchedMentors.map((mentor) => (
                    <div
                      key={mentor.mentorId || mentor.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all group"
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-blue-400 dark:text-blue-300">person</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Link to={`/mentor/${mentor.mentorId || mentor.id}`}>
                              <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {mentor.nickname}
                              </h2>
                            </Link>
                            <div className="flex items-center text-yellow-500 text-sm font-bold">
                              <span className="material-symbols-outlined text-sm mr-0.5">star</span>
                              {mentor.averageRating?.toFixed(1) || '0.0'}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            리뷰 {mentor.reviewCount}개
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {mentor.skills.slice(0, 3).map((skill, idx) => {
                              const skillName = typeof skill === 'string' ? skill : skill.name;
                              return (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded-md uppercase"
                                >
                                  {skillName}
                                </span>
                              );
                            })}
                            {mentor.skills.length > 3 && (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-md">
                                +{mentor.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                        {mentor.introduction || '아직 소개가 없습니다.'}
                      </p>
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end">
                        <Link
                          to={`/mentor/${mentor.mentorId || mentor.id}`}
                          className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary/20"
                        >
                          자세히 보기
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Empty State Card */}
                  {searchedMentors.length === 0 && !isLoading && (
                    <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-8 text-slate-400">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
                        <p className="text-sm">검색 결과가 없습니다.</p>
                      </div>
                    </div>
                  )}

                  {/* CTA Card */}
                  {searchedMentors.length > 0 && (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-8 text-slate-400">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
                        <p className="text-sm">원하시는 멘토를 찾지 못하셨나요?</p>
                        <Link to="/mentor/apply" className="mt-2 text-primary text-sm font-bold hover:underline block">
                          직접 멘토로 지원하기
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (page < 3) {
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          } transition-colors`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages - 1}
                      className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
